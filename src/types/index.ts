export interface ProjectConfig {
  nodeVersion: string;
  port: string;
  workDir: string;
  scripts: Record<string, string>;
  envVars: Record<string, string>;
  selectedScript?: string;
}

export interface DockerOptions {
  node: string;
  port?: string;
  cache?: boolean;
}

export interface PackageJson {
  name: string;
  version?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}
