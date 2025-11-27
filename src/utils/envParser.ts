import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

export class EnvParser {
  private workDir: string;

  constructor(workDir: string = process.cwd()) {
    this.workDir = workDir;
  }

  public parseEnvFile(envFileName: string = '.env'): Record<string, string> {
    const envFilePath = path.join(this.workDir, envFileName);
    
    if (!fs.existsSync(envFilePath)) {
      return {};
    }

    const envConfig = dotenv.parse(fs.readFileSync(envFilePath));
    return envConfig;
  }

  public findEnvFiles(): string[] {
    const envFiles: string[] = [];
    const commonEnvFiles = [
      '.env',
      '.env.local',
      '.env.development',
      '.env.production',
    ];

    for (const file of commonEnvFiles) {
      const filePath = path.join(this.workDir, file);
      if (fs.existsSync(filePath)) {
        envFiles.push(file);
      }
    }

    return envFiles;
  }

  public formatEnvForDocker(envVars: Record<string, string>): string[] {
    return Object.entries(envVars).map(([key, value]) => {
      // Escape quotes and special characters
      const escapedValue = value.replace(/"/g, '\\"');
      return `-e ${key}="${escapedValue}"`;
    });
  }
}
