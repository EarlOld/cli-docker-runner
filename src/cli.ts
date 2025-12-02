#!/usr/bin/env node
import { Command } from 'commander';
import { runCommand } from './commands/run';
import { installCommand } from './commands/install';
import { updateCommand } from './commands/update';
import { cleanCommand } from './commands/clean';

const program = new Command();

program
  .name('docker-runner')
  .description('Secure CLI tool to run frontend projects in Docker containers')
  .version('2.1.2');

program
  .command('run')
  .description('Run project in Docker container (reuses existing container if available)')
  .option('-n, --node <version>', 'Node.js version (e.g., 18, 20, 22)', '22')
  .option('-p, --port <port>', 'Port to expose', '3000')
  .option('--no-cache', 'Build Docker image without cache')
  .action(runCommand);

program
  .command('install')
  .description('Install dependencies in Docker container')
  .option('-n, --node <version>', 'Node.js version (e.g., 18, 20, 22)', '22')
  .action(installCommand);

program
  .command('update')
  .description('Update dependencies in Docker container')
  .option('-n, --node <version>', 'Node.js version (e.g., 18, 20, 22)', '22')
  .action(updateCommand);

program
  .command('clean')
  .description('Remove Docker containers and images for this project')
  .option('-f, --force', 'Force removal without confirmation')
  .action(cleanCommand);

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
