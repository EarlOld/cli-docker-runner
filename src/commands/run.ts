import chalk from 'chalk';
import { DockerOptions } from '../types';
import { PackageJsonParser } from '../utils/packageJsonParser';
import { EnvParser } from '../utils/envParser';
import { DockerfileGenerator } from '../utils/dockerfileGenerator';
import { DockerManager } from '../utils/dockerManager';
import { InteractivePrompts } from '../utils/interactivePrompts';

export async function runCommand(options: DockerOptions): Promise<void> {
  try {
    console.log(chalk.bold.blue('\n🚀 Docker Runner - Starting...\n'));

    const workDir = process.cwd();
    
    // Check Docker installation
    const dockerManager = new DockerManager(workDir);
    if (!dockerManager.checkDockerInstalled()) {
      console.error(chalk.red('❌ Docker is not installed or not running'));
      console.log(chalk.yellow('Please install Docker from https://www.docker.com/'));
      process.exit(1);
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

    // Generate Dockerfile
    const dockerfileGenerator = new DockerfileGenerator();
    const dockerfileContent = dockerfileGenerator.generateDockerfile(options.nodeVersion);
    const dockerfilePath = dockerfileGenerator.saveDockerfile(dockerfileContent, workDir);
    dockerfileGenerator.saveDockerIgnore(workDir);

    console.log(chalk.green(`✓ Generated Dockerfile with Node.js ${options.nodeVersion}`));

    // Build Docker image
    dockerManager.buildImage(dockerfilePath, options.nodeVersion, options.noCache);

    // Run container
    const port = options.port || '3000';
    console.log(chalk.blue(`\n📦 Running with configuration:`));
    console.log(chalk.gray(`  - Script: ${selectedScript}`));
    console.log(chalk.gray(`  - Node: ${options.nodeVersion}`));
    console.log(chalk.gray(`  - Port: ${port}`));
    console.log(chalk.gray(`  - Env vars: ${Object.keys(envVars).length}`));

    dockerManager.runContainer(options.nodeVersion, selectedScript, port, envVars);

  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
    }
    process.exit(1);
  }
}
