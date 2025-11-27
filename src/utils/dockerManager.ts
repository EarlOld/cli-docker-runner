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

    // Stop and remove existing container
    this.stopContainer(containerName);

    console.log(chalk.blue(`\n🐳 Starting container: ${containerName}\n`));

    // Run container with interactive mode
    // Use array format for better argument handling
    const baseCommand = [
      'docker', 'run', '--rm',
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
}
