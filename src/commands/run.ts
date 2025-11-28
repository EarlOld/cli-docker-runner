import chalk from 'chalk';
import { DockerOptions } from '../types';
import { PackageJsonParser } from '../utils/packageJsonParser';
import { EnvParser } from '../utils/envParser';
import { DockerfileGenerator } from '../utils/dockerfileGenerator';
import { DockerManager } from '../utils/dockerManager';
import { InteractivePrompts } from '../utils/interactivePrompts';
import { FileWatcher } from '../utils/fileWatcher';

export async function runCommand(options: DockerOptions): Promise<void> {
  try {
    console.log(chalk.bold.blue('\n🚀 Docker Runner - Starting...\n'));

    const workDir = process.cwd();
    const nodeVersion = options.node || '20';
    const noCache = options.cache === false; // --no-cache sets cache to false
    
    // Check Docker installation
    const dockerManager = new DockerManager(workDir);
    if (!dockerManager.checkDockerInstalled()) {
      console.error(chalk.red('❌ Docker is not installed or not running'));
      console.log(chalk.yellow('Please install Docker from https://www.docker.com/'));
      process.exit(1);
    }

    // Check for file changes
    const fileWatcher = new FileWatcher(workDir);
    const imageName = dockerManager.getImageName(nodeVersion);
    const containerName = `${dockerManager.projectName}-container`;
    const imageExists = dockerManager.imageExists(imageName);
    const containerExists = dockerManager.containerExists(containerName);
    const hasDependencyChanges = fileWatcher.hasDependencyChanges();
    const hasCodeChanges = fileWatcher.hasChanges();

    // Determine rebuild strategy
    const needsImageRebuild = !imageExists || hasDependencyChanges || noCache;
    const needsContainerRestart = hasCodeChanges && !hasDependencyChanges;

    // Case 1: No changes at all - reuse existing container (unless --no-cache)
    if (imageExists && !hasCodeChanges && !hasDependencyChanges && containerExists && !noCache) {
      console.log(chalk.green('✓ No changes detected in project files'));
      console.log(chalk.blue('♻️  Reusing existing container with live file sync\n'));
      
      if (!dockerManager.containerIsRunning(containerName)) {
        dockerManager.restartContainer(containerName);
      } else {
        console.log(chalk.yellow('Container is already running'));
      }
      return;
    }

    // Case 2: Only code changes - restart container with live sync (no rebuild)
    if (imageExists && needsContainerRestart && containerExists) {
      console.log(chalk.green('✓ Only source code changed - no rebuild needed'));
      console.log(chalk.blue('📄 Files will sync automatically via volume mount'));
      console.log(chalk.blue('🔄 Restarting container to apply changes...\n'));
      
      dockerManager.restartContainer(containerName);
      fileWatcher.saveHash(); // Update hash after restart
      return;
    }

    // Case 3: Dependencies changed, no image, or --no-cache - full rebuild
    if (hasDependencyChanges && imageExists) {
      console.log(chalk.yellow('⚠️  Dependencies changed (package.json/package-lock.json)'));
      console.log(chalk.blue('🔨 Rebuilding Docker image with new dependencies...\n'));
    } else if (!imageExists) {
      console.log(chalk.blue('🔨 Building Docker image for the first time...\n'));
    } else if (noCache) {
      console.log(chalk.yellow('🔄 Force rebuild requested (--no-cache)'));
      console.log(chalk.blue('🔨 Rebuilding Docker image without cache...\n'));
    }

    // Parse package.json
    const packageParser = new PackageJsonParser(workDir);
    const scripts = packageParser.getScripts();

    if (Object.keys(scripts).length === 0) {
      console.error(chalk.red('❌ No scripts found in package.json'));
      process.exit(1);
    }

    // Interactive script selection
    const prompts = new InteractivePrompts();
    const selectedScript = await prompts.selectScript(scripts);

    console.log(chalk.green(`✓ Selected script: ${selectedScript}`));

    // Handle environment variables
    const envParser = new EnvParser(workDir);
    const envFiles = envParser.findEnvFiles();
    
    let envVars: Record<string, string> = {};
    const envSource = await prompts.selectEnvFile(envFiles);

    if (envSource === 'manual') {
      envVars = await prompts.enterEnvVariables();
    } else if (envSource) {
      envVars = envParser.parseEnvFile(envSource);
      console.log(chalk.green(`✓ Loaded ${Object.keys(envVars).length} variables from ${envSource}`));
    }

    // Generate Dockerfile and rebuild if needed
    if (needsImageRebuild) {
      const dockerfileGenerator = new DockerfileGenerator();
      // Check if nodemon is needed for this script
      const needsNodemon = dockerManager.shouldUseLiveReload(selectedScript);
      const dockerfileContent = dockerfileGenerator.generateDockerfile(nodeVersion, '/app', needsNodemon);
      const dockerfilePath = dockerfileGenerator.saveDockerfile(dockerfileContent, workDir);
      dockerfileGenerator.saveDockerIgnore(workDir);

      console.log(chalk.green(`✓ Generated Dockerfile with Node.js ${nodeVersion}`));

      // Stop existing container if running (we need to rebuild)
      if (containerExists) {
        dockerManager.stopContainer(containerName);
      }

      // Build Docker image
      dockerManager.buildImage(dockerfilePath, nodeVersion, noCache);

      // Save current hashes after successful build
      fileWatcher.saveHash();
      fileWatcher.saveDependencyHash();
    }

    // Run container
    const port = options.port || '3000';
    console.log(chalk.blue(`\n📦 Running with configuration:`));
    console.log(chalk.gray(`  - Script: ${selectedScript}`));
    console.log(chalk.gray(`  - Node: ${nodeVersion}`));
    console.log(chalk.gray(`  - Port: ${port}`));
    console.log(chalk.gray(`  - Env vars: ${Object.keys(envVars).length}`));
    console.log(chalk.gray(`  - Live sync: ${chalk.green('enabled')} (files auto-sync via volume mount)`));

    dockerManager.runContainer(nodeVersion, selectedScript, port, envVars);

  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
    }
    process.exit(1);
  }
}
