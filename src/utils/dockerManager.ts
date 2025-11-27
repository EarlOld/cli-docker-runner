import { execSync } from 'child_process';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';

export class DockerManager {
  private projectName: string;
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
    ];

    // Add environment variables
    Object.entries(envVars).forEach(([key, value]) => {
      baseCommand.push('-e', `${key}=${value}`);
    });

    // Add image and command
    baseCommand.push(imageName, 'npm', 'run', script);

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
}
