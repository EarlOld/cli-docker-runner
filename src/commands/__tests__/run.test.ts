import { DockerfileGenerator } from '../../utils/dockerfileGenerator';

describe('runCommand node version handling', () => {
  let dockerfileGenerator: DockerfileGenerator;

  beforeEach(() => {
    dockerfileGenerator = new DockerfileGenerator();
  });

  describe('Node version validation in commands', () => {
    it('should generate Dockerfile with correct node version', () => {
      const nodeVersion = '18';
      const dockerfile = dockerfileGenerator.generateDockerfile(nodeVersion);

      expect(dockerfile).toContain('FROM node:18-alpine');
      expect(dockerfile).not.toContain('undefined');
    });

    it('should use default node version when undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dockerfile = dockerfileGenerator.generateDockerfile(undefined as any);
      expect(dockerfile).toContain('FROM node:22-alpine');
    });

    it('should not allow empty node version', () => {
      expect(() => dockerfileGenerator.generateDockerfile('')).toThrow(
        'Node.js version is required and cannot be empty'
      );
    });

    it('should handle various node versions', () => {
      const versions = ['16', '18', '20', '21'];

      versions.forEach(version => {
        const dockerfile = dockerfileGenerator.generateDockerfile(version);
        expect(dockerfile).toContain(`FROM node:${version}-alpine`);
        expect(dockerfile).not.toContain('FROM node:undefined');
      });
    });

    it('should default to version 22 when undefined is coalesced', () => {
      // Simulate what happens in run.ts: const nodeVersion = options.node || '22'
      let undefinedValue: string | undefined;
      const nodeVersion = undefinedValue || '22';
      const dockerfile = dockerfileGenerator.generateDockerfile(nodeVersion);

      expect(dockerfile).toContain('FROM node:22-alpine');
      expect(dockerfile).not.toContain('undefined');
    });

    it('should preserve specified version over default', () => {
      const specifiedVersion: string | undefined = '18';
      const nodeVersion = specifiedVersion || '22';
      const dockerfile = dockerfileGenerator.generateDockerfile(nodeVersion);

      expect(dockerfile).toContain('FROM node:18-alpine');
    });
  });
});
