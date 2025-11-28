import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';

export class DockerManager {
  public projectName: string;
  private workDir: string;

  constructor(workDir: string = process.cwd()) {
    this.workDir = workDir;
    this.projectName = path.basename(workDir).toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }

  public checkDockerInstalled(): boolean {
    try {
      execSync('docker --version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  public buildImage(
    dockerfilePath: string,
    nodeVersion: string,
    noCache: boolean = false
  ): void {
    const imageName = `${this.projectName}-runner:node${nodeVersion}`;
    const spinner = ora('Building Docker image...').start();

    try {
      const cacheFlag = noCache ? '--no-cache' : '';
      const command = `docker build ${cacheFlag} -t ${imageName} -f ${dockerfilePath} ${this.workDir}`;
      
      execSync(command, { 
        stdio: 'inherit',
        cwd: this.workDir 
      });
      
      spinner.succeed(chalk.green('Docker image built successfully'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to build Docker image'));
      throw error;
    }
  }

  public runContainer(
    nodeVersion: string,
    script: string,
    port: string,
    envVars: Record<string, string>
  ): void {
    const imageName = `${this.projectName}-runner:node${nodeVersion}`;
    const containerName = `${this.projectName}-container`;

    // Check if container exists and is stopped
    if (this.containerExists(containerName) && !this.containerIsRunning(containerName)) {
      console.log(chalk.yellow(`\n♻️  Found existing container: ${containerName}`));
      console.log(chalk.blue('   Reusing existing container instead of creating new one\n'));
      this.restartContainer(containerName);
      return;
    }

    // Stop and remove existing running container
    if (this.containerIsRunning(containerName)) {
      this.stopContainer(containerName);
    }

    console.log(chalk.blue(`\n🐳 Starting new container: ${containerName}\n`));

    // Run container with interactive mode
    // Use array format for better argument handling
    const baseCommand = [
      'docker', 'run',
      '--name', containerName,
      '-p', `${port}:${port}`,
      '-v', `${this.workDir}:/app`,
      '-v', '/app/node_modules', // Preserve node_modules in container
    ];

    // Add environment variables
    Object.entries(envVars).forEach(([key, value]) => {
      baseCommand.push('-e', `${key}=${value}`);
    });

    // Determine if we should use nodemon for live reload
    const shouldUseLiveReload = this.shouldUseLiveReload(script);
    
    if (shouldUseLiveReload) {
      // Use nodemon for live reload
      const entryFile = this.getEntryFile(script);
      baseCommand.push(imageName, 'nodemon', '--legacy-watch', entryFile);
      console.log(chalk.green('🔄 Live reload enabled - changes will be detected automatically'));
    } else {
      // Use regular npm script with framework-specific flags
      const scriptCommand = this.getScriptCommand(script);
      if (this.isViteScript(scriptCommand)) {
        // For Vite and Astro, add --host 0.0.0.0 and --port to make it accessible from host
        baseCommand.push(imageName, 'npm', 'run', script, '--', '--host', '0.0.0.0', '--port', port);
        if (scriptCommand.includes('astro')) {
          console.log(chalk.green('🚀 Astro dev server configured to listen on all interfaces'));
        } else {
          console.log(chalk.green('🌐 Vite server configured to listen on all interfaces'));
        }
      } else {
        baseCommand.push(imageName, 'npm', 'run', script);
      }
    }

    try {
      execSync(baseCommand.join(' '), { 
        stdio: 'inherit',
        cwd: this.workDir
      });
    } catch (error) {
      console.log(chalk.yellow('\nContainer stopped'));
    }
  }

  public stopContainer(containerName: string): void {
    try {
      execSync(`docker stop ${containerName}`, { stdio: 'ignore' });
      execSync(`docker rm ${containerName}`, { stdio: 'ignore' });
    } catch {
      // Container doesn't exist or already stopped
    }
  }

  public containerExists(containerName: string): boolean {
    try {
      const result = execSync(`docker ps -a --filter "name=${containerName}" --format "{{.Names}}"`, { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      return result.trim() === containerName;
    } catch {
      return false;
    }
  }

  public containerIsRunning(containerName: string): boolean {
    try {
      const result = execSync(`docker ps --filter "name=${containerName}" --format "{{.Names}}"`, { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      return result.trim() === containerName;
    } catch {
      return false;
    }
  }

  public imageExists(imageName: string): boolean {
    try {
      execSync(`docker image inspect ${imageName}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  public restartContainer(containerName: string): void {
    try {
      console.log(chalk.blue(`\n🔄 Restarting existing container: ${containerName}\n`));
      execSync(`docker start -a ${containerName}`, { 
        stdio: 'inherit',
        cwd: this.workDir 
      });
    } catch (error) {
      console.log(chalk.yellow('\nContainer stopped'));
    }
  }

  public installDependencies(nodeVersion: string): void {
    const imageName = `${this.projectName}-runner:node${nodeVersion}`;
    const spinner = ora('Installing dependencies in Docker...').start();

    try {
      const command = `docker run --rm -v ${this.workDir}:/app -w /app ${imageName} npm install`;
      
      execSync(command, { 
        stdio: 'inherit',
        cwd: this.workDir 
      });
      
      spinner.succeed(chalk.green('Dependencies installed successfully'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to install dependencies'));
      throw error;
    }
  }

  public updateDependencies(nodeVersion: string): void {
    const imageName = `${this.projectName}-runner:node${nodeVersion}`;
    const spinner = ora('Updating dependencies in Docker...').start();

    try {
      const command = `docker run --rm -v ${this.workDir}:/app -w /app ${imageName} npm update`;
      
      execSync(command, { 
        stdio: 'inherit',
        cwd: this.workDir 
      });
      
      spinner.succeed(chalk.green('Dependencies updated successfully'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to update dependencies'));
      throw error;
    }
  }

  public getImageName(nodeVersion: string): string {
    return `${this.projectName}-runner:node${nodeVersion}`;
  }

  public cleanupAll(): void {
    const spinner = ora('Removing Docker containers and images...').start();

    try {
      // Stop and remove all containers for this project
      const containerPattern = `${this.projectName}-container`;
      try {
        execSync(`docker ps -a --filter "name=${containerPattern}" -q | xargs -r docker rm -f`, { 
          stdio: 'pipe',
          shell: '/bin/bash'
        });
        spinner.text = 'Containers removed, cleaning up images...';
      } catch {
        // No containers found or already removed
      }

      // Remove all images for this project
      const imagePattern = `${this.projectName}-runner`;
      try {
        execSync(`docker images "${imagePattern}" -q | xargs -r docker rmi -f`, { 
          stdio: 'pipe',
          shell: '/bin/bash'
        });
      } catch {
        // No images found or already removed
      }

      spinner.succeed(chalk.green('Docker resources cleaned successfully'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to clean Docker resources'));
      throw error;
    }
  }

  /**
   * Determine if a script should use live reload
   */
  public shouldUseLiveReload(script: string): boolean {
    try {
      const packageJsonPath = path.join(this.workDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const scriptCommand = packageJson.scripts?.[script];
      
      if (!scriptCommand) return false;
      
      // If script uses frameworks with built-in dev servers, don't use nodemon
      const frameworksWithDevServer = ['vite', 'webpack', 'next', 'nuxt', 'gatsby', 'astro'];
      for (const framework of frameworksWithDevServer) {
        if (scriptCommand.includes(framework)) {
          return false; // Use npm run script directly
        }
      }
      
      // For plain Node.js scripts, use nodemon for live reload
      const liveReloadScripts = ['start', 'dev', 'serve', 'watch'];
      return liveReloadScripts.includes(script.toLowerCase());
    } catch {
      return false;
    }
  }

  /**
   * Get entry file for a script
   */
  private getEntryFile(script: string): string {
    try {
      const packageJsonPath = path.join(this.workDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // Try to parse the script command to find the entry file
      const scriptCommand = packageJson.scripts?.[script];
      if (scriptCommand) {
        // Extract file from common patterns like "node server.js" or "node src/index.js"
        const nodeMatch = scriptCommand.match(/node\s+([^\s]+)/);
        if (nodeMatch) {
          return nodeMatch[1];
        }
      }
      
      // Fallback to common entry files
      const commonEntryFiles = ['server.js', 'index.js', 'app.js', 'src/index.js', 'src/app.js'];
      for (const file of commonEntryFiles) {
        if (fs.existsSync(path.join(this.workDir, file))) {
          return file;
        }
      }
      
      // Last resort - use the main field from package.json
      return packageJson.main || 'index.js';
    } catch {
      // If all fails, default to common entry files
      return 'server.js';
    }
  }

  /**
   * Get script command from package.json
   */
  public getScriptCommand(script: string): string {
    try {
      const packageJsonPath = path.join(this.workDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      return packageJson.scripts?.[script] || '';
    } catch {
      return '';
    }
  }

  /**
   * Check if script command uses dev server that needs host configuration (Vite, Astro)
   */
  public isViteScript(scriptCommand: string): boolean {
    return (scriptCommand.includes('vite') && !scriptCommand.includes('vite build')) ||
           (scriptCommand.includes('astro') && !scriptCommand.includes('astro build'));
  }
}
