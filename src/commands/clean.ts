import chalk from 'chalk';
import inquirer from 'inquirer';
import { DockerManager } from '../utils/dockerManager';

interface CleanOptions {
  force?: boolean;
}

export async function cleanCommand(options: CleanOptions): Promise<void> {
  try {
    console.log(chalk.bold.blue('\n🧹 Cleaning Docker resources...\n'));

    const workDir = process.cwd();
    const dockerManager = new DockerManager(workDir);

    if (!dockerManager.checkDockerInstalled()) {
      console.error(chalk.red('❌ Docker is not installed or not running'));
      console.log(chalk.yellow('Please install Docker from https://www.docker.com/'));
      process.exit(1);
    }

    // Confirm deletion unless --force flag is used
    if (!options.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'This will remove all Docker containers and images for this project. Continue?',
          default: false,
        },
      ]);

      if (!confirm) {
        console.log(chalk.yellow('\n❌ Operation cancelled'));
        process.exit(0);
      }
    }

    // Clean up containers and images
    dockerManager.cleanupAll();

    console.log(chalk.green('\n✅ Cleanup completed successfully!'));
    console.log(chalk.gray('   All Docker containers and images have been removed'));

  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
    }
    process.exit(1);
  }
}
