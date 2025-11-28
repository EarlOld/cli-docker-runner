import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export class FileWatcher {
  private workDir: string;
  private hashFile: string;
  private dependencyHashFile: string;

  constructor(workDir: string = process.cwd()) {
    this.workDir = workDir;
    this.hashFile = path.join(workDir, '.docker-runner-hash');
    this.dependencyHashFile = path.join(workDir, '.docker-runner-deps-hash');
  }

  /**
   * Calculate hash of project files (excluding node_modules, .git, etc.)
   */
  public calculateProjectHash(): string {
    const hash = crypto.createHash('sha256');
    const filesToHash: string[] = [];

    // Read package.json and package-lock.json
    const packageJsonPath = path.join(this.workDir, 'package.json');
    const packageLockPath = path.join(this.workDir, 'package-lock.json');

    if (fs.existsSync(packageJsonPath)) {
      filesToHash.push(fs.readFileSync(packageJsonPath, 'utf-8'));
    }

    if (fs.existsSync(packageLockPath)) {
      filesToHash.push(fs.readFileSync(packageLockPath, 'utf-8'));
    }

    // Hash root level source files
    const rootFiles = fs.readdirSync(this.workDir);
    for (const file of rootFiles) {
      const filePath = path.join(this.workDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        const ext = path.extname(file);
        if (['.js', '.ts', '.jsx', '.tsx', '.json', '.css', '.scss', '.html', '.vue'].includes(ext)) {
          // Skip package.json and package-lock.json as they're already included
          if (!['package.json', 'package-lock.json'].includes(file)) {
            filesToHash.push(fs.readFileSync(filePath, 'utf-8'));
          }
        }
      }
    }

    // Get list of source files (simple implementation)
    const srcDirs = ['src', 'app', 'pages', 'components', 'lib', 'public'];
    
    for (const dir of srcDirs) {
      const dirPath = path.join(this.workDir, dir);
      if (fs.existsSync(dirPath)) {
        this.hashDirectory(dirPath, filesToHash);
      }
    }

    // Hash all collected files
    filesToHash.forEach(content => hash.update(content));
    
    return hash.digest('hex');
  }

  /**
   * Recursively hash directory contents
   */
  private hashDirectory(dirPath: string, filesToHash: string[]): void {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules, .git, dist, build, etc.
        if (!['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(file)) {
          this.hashDirectory(filePath, filesToHash);
        }
      } else if (stat.isFile()) {
        // Only hash relevant files
        const ext = path.extname(file);
        if (['.js', '.ts', '.jsx', '.tsx', '.json', '.css', '.scss', '.html', '.vue'].includes(ext)) {
          filesToHash.push(fs.readFileSync(filePath, 'utf-8'));
        }
      }
    }
  }

  /**
   * Save current project hash
   */
  public saveHash(): void {
    const hash = this.calculateProjectHash();
    fs.writeFileSync(this.hashFile, hash, 'utf-8');
  }

  /**
   * Get saved hash
   */
  public getSavedHash(): string | null {
    try {
      if (fs.existsSync(this.hashFile)) {
        return fs.readFileSync(this.hashFile, 'utf-8').trim();
      }
    } catch {
      // File doesn't exist or can't be read
    }
    return null;
  }

  /**
   * Check if project files have changed
   */
  public hasChanges(): boolean {
    const currentHash = this.calculateProjectHash();
    const savedHash = this.getSavedHash();

    if (!savedHash) {
      return true; // No saved hash, assume changes
    }

    return currentHash !== savedHash;
  }

  /**
   * Calculate hash only for dependency files (package.json, package-lock.json)
   */
  public calculateDependencyHash(): string {
    const hash = crypto.createHash('sha256');
    const filesToHash: string[] = [];

    const packageJsonPath = path.join(this.workDir, 'package.json');
    const packageLockPath = path.join(this.workDir, 'package-lock.json');

    if (fs.existsSync(packageJsonPath)) {
      filesToHash.push(fs.readFileSync(packageJsonPath, 'utf-8'));
    }

    if (fs.existsSync(packageLockPath)) {
      filesToHash.push(fs.readFileSync(packageLockPath, 'utf-8'));
    }

    filesToHash.forEach(content => hash.update(content));
    return hash.digest('hex');
  }

  /**
   * Check if dependencies have changed (requires rebuild)
   */
  public hasDependencyChanges(): boolean {
    const currentHash = this.calculateDependencyHash();
    const savedHash = this.getSavedDependencyHash();

    if (!savedHash) {
      return true; // No saved hash, assume changes
    }

    return currentHash !== savedHash;
  }

  /**
   * Save current dependency hash
   */
  public saveDependencyHash(): void {
    const hash = this.calculateDependencyHash();
    fs.writeFileSync(this.dependencyHashFile, hash, 'utf-8');
  }

  /**
   * Get saved dependency hash
   */
  public getSavedDependencyHash(): string | null {
    try {
      if (fs.existsSync(this.dependencyHashFile)) {
        return fs.readFileSync(this.dependencyHashFile, 'utf-8').trim();
      }
    } catch {
      // File doesn't exist or can't be read
    }
    return null;
  }

  /**
   * Clean up hash files
   */
  public cleanup(): void {
    try {
      if (fs.existsSync(this.hashFile)) {
        fs.unlinkSync(this.hashFile);
      }
      if (fs.existsSync(this.dependencyHashFile)) {
        fs.unlinkSync(this.dependencyHashFile);
      }
    } catch {
      // Ignore errors
    }
  }
}
