import chalk from 'chalk';
import { DockerOptions } from '../types';
import { DockerfileGenerator } from '../utils/dockerfileGenerator';
import { DockerManager } from '../utils/dockerManager';

export async function updateCommand(options: Pick<DockerOptions, 'node'>): Promise<void> {
  try {
    console.log(chalk.bold.blue('\n🔄 Updating dependencies in Docker...\n'));

    const workDir = process.cwd();
    const nodeVersion = options.node || '20';
    
    // Check Docker installation
    const dockerManager = new DockerManager(workDir);
    if (!dockerManager.checkDockerInstalled()) {
      console.error(chalk.red('❌ Docker is not installed or not running'));
      console.log(chalk.yellow('Please install Docker from https://www.docker.com/'));
      process.exit(1);
    }

    // Generate Dockerfile if needed
    const dockerfileGenerator = new DockerfileGenerator();
    const dockerfileContent = dockerfileGenerator.generateDockerfile(nodeVersion);
    const dockerfilePath = dockerfileGenerator.saveDockerfile(dockerfileContent, workDir);
    dockerfileGenerator.saveDockerIgnore(workDir);

    // Build image
    dockerManager.buildImage(dockerfilePath, nodeVersion, true);

    // Update dependencies
    dockerManager.updateDependencies(nodeVersion);

    console.log(chalk.green('\n✅ Dependencies updated successfully!'));

  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
    }
    process.exit(1);
  }
}
