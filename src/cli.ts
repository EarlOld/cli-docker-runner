#!/usr/bin/env node
import { Command } from 'commander';
import { runCommand } from './commands/run';
import { installCommand } from './commands/install';
import { updateCommand } from './commands/update';

const program = new Command();

program
  .name('docker-runner')
  .description('Secure CLI tool to run frontend projects in Docker containers')
  .version('1.0.0');

program
  .command('run')
  .description('Run project in Docker container')
  .option('-n, --node <version>', 'Node.js version (e.g., 18, 20)', '20')
  .option('-p, --port <port>', 'Port to expose', '3000')
  .option('--no-cache', 'Build Docker image without cache')
  .action(runCommand);

program
  .command('install')
  .description('Install dependencies in Docker container')
  .option('-n, --node <version>', 'Node.js version (e.g., 18, 20)', '20')
  .action(installCommand);

program
  .command('update')
  .description('Update dependencies in Docker container')
  .option('-n, --node <version>', 'Node.js version (e.g., 18, 20)', '20')
  .action(updateCommand);

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
