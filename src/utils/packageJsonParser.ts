import * as fs from 'fs';
import * as path from 'path';
import { PackageJson } from '../types';

export class PackageJsonParser {
  private workDir: string;

  constructor(workDir: string = process.cwd()) {
    this.workDir = workDir;
  }

  public readPackageJson(): PackageJson {
    const packageJsonPath = path.join(this.workDir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found in current directory');
    }

    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    return JSON.parse(content) as PackageJson;
  }

  public getScripts(): Record<string, string> {
    const packageJson = this.readPackageJson();
    return packageJson.scripts || {};
  }

  public getScriptNames(): string[] {
    return Object.keys(this.getScripts());
  }

  public hasScript(scriptName: string): boolean {
    const scripts = this.getScripts();
    return scriptName in scripts;
  }
}
