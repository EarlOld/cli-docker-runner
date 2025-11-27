import inquirer from 'inquirer';
import chalk from 'chalk';

export class InteractivePrompts {
  public async selectScript(scripts: Record<string, string>): Promise<string> {
    const scriptNames = Object.keys(scripts);

    if (scriptNames.length === 0) {
      throw new Error('No scripts found in package.json');
    }

    const { selectedScript } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedScript',
        message: 'Select a script to run:',
        choices: scriptNames.map((name) => ({
          name: `${chalk.cyan(name)}: ${chalk.gray(scripts[name])}`,
          value: name,
        })),
      },
    ]);

    return selectedScript;
  }

  public async selectEnvFile(envFiles: string[]): Promise<string | null> {
    if (envFiles.length === 0) {
      const { createManually } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'createManually',
          message: 'No .env files found. Do you want to enter environment variables manually?',
          default: false,
        },
      ]);

      return createManually ? 'manual' : null;
    }

    const choices = [
      ...envFiles.map((file) => ({ name: file, value: file })),
      { name: chalk.gray('Enter manually'), value: 'manual' },
      { name: chalk.gray('Skip (no env vars)'), value: null },
    ];

    const { selectedFile } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedFile',
        message: 'Select environment variables source:',
        choices,
      },
    ]);

    return selectedFile;
  }

  public async enterEnvVariables(): Promise<Record<string, string>> {
    const envVars: Record<string, string> = {};
    let addMore = true;

    console.log(chalk.yellow('\nEnter environment variables (leave empty to finish):\n'));

    while (addMore) {
      const { key } = await inquirer.prompt([
        {
          type: 'input',
          name: 'key',
          message: 'Variable name:',
          validate: (input) => {
            if (!input && Object.keys(envVars).length === 0) {
              return 'Please enter at least one variable or press Ctrl+C to skip';
            }
            if (input && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(input)) {
              return 'Invalid variable name. Use only letters, numbers, and underscores.';
            }
            return true;
          },
        },
      ]);

      if (!key) {
        break;
      }

      const { value } = await inquirer.prompt([
        {
          type: 'input',
          name: 'value',
          message: `Value for ${chalk.cyan(key)}:`,
        },
      ]);

      envVars[key] = value;

      const { continue: continueAdding } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: 'Add another variable?',
          default: true,
        },
      ]);

      addMore = continueAdding;
    }

    return envVars;
  }

  public async confirmAction(message: string, defaultValue: boolean = true): Promise<boolean> {
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message,
        default: defaultValue,
      },
    ]);

    return confirmed;
  }
}
