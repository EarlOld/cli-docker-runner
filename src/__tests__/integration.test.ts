import { FileWatcher } from '../utils/fileWatcher';
import * as fs from 'fs';
import * as path from 'path';

describe('Integration Tests', () => {
  const examplesDir = path.join(__dirname, '../../examples');
  const testProjects = ['test-node', 'test-react', 'test-vue'];

  beforeAll(() => {
    // Ensure example projects exist
    for (const project of testProjects) {
      const projectPath = path.join(examplesDir, project);
      if (!fs.existsSync(projectPath)) {
        throw new Error(`Example project ${project} not found at ${projectPath}`);
      }
    }
  });

  afterEach(async () => {
    // Cleanup hash files after each test
    for (const project of testProjects) {
      const projectPath = path.join(examplesDir, project);
      const fileWatcher = new FileWatcher(projectPath);

      try {
        fileWatcher.cleanup();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('FileWatcher with Real Projects', () => {
    it.each(testProjects)('should calculate consistent hash for %s', (projectName) => {
      const projectPath = path.join(examplesDir, projectName);
      const fileWatcher = new FileWatcher(projectPath);

      const hash1 = fileWatcher.calculateProjectHash();
      const hash2 = fileWatcher.calculateProjectHash();

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA256 length
    });

    it.each(testProjects)('should detect no changes when project unchanged for %s', (projectName) => {
      const projectPath = path.join(examplesDir, projectName);
      const fileWatcher = new FileWatcher(projectPath);

      // Save initial hash
      fileWatcher.saveHash();

      // Check for changes immediately
      const hasChanges = fileWatcher.hasChanges();

      expect(hasChanges).toBe(false);
    });

    it.each(testProjects)('should detect changes when new files added to %s', (projectName) => {
      const projectPath = path.join(examplesDir, projectName);
      const fileWatcher = new FileWatcher(projectPath);
      const testFilePath = path.join(projectPath, 'test-change.js');

      try {
        // Save initial hash
        fileWatcher.saveHash();

        // Add a new file
        fs.writeFileSync(testFilePath, 'console.log("test change");');

        // Check for changes
        const hasChanges = fileWatcher.hasChanges();

        expect(hasChanges).toBe(true);
      } finally {
        // Cleanup test file
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    });
  });

  describe('Project Name Generation', () => {
    it.each(testProjects)('should generate valid lowercase project names for %s', (projectName) => {
      const projectPath = path.join(examplesDir, projectName);
      
      // Test project name sanitization logic
      const basename = path.basename(projectPath).toLowerCase();
      const sanitized = basename.replace(/[^a-z0-9-]/g, '-');
      
      expect(sanitized).toMatch(/^[a-z0-9-]+$/);
      expect(sanitized).toContain(projectName.toLowerCase());
    });

    it.each(testProjects)('should have valid project structure for %s', (projectName) => {
      const projectPath = path.join(examplesDir, projectName);
      
      // Each project should have package.json
      expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
      
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectPath, 'package.json'), 'utf-8')
      );
      
      expect(packageJson.name).toBeDefined();
      expect(typeof packageJson.name).toBe('string');
    });
  });

  describe('File Change Detection Integration', () => {
    it('should work with Node.js project structure', () => {
      const projectPath = path.join(examplesDir, 'test-node');
      const fileWatcher = new FileWatcher(projectPath);

      // Verify project has required files
      expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'server.js'))).toBe(true);

      const hash = fileWatcher.calculateProjectHash();
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });

    it('should work with React project structure', () => {
      const projectPath = path.join(examplesDir, 'test-react');
      const fileWatcher = new FileWatcher(projectPath);

      // Verify project has required files
      expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'src'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'vite.config.ts'))).toBe(true);

      const hash = fileWatcher.calculateProjectHash();
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });

    it('should work with Vue project structure', () => {
      const projectPath = path.join(examplesDir, 'test-vue');
      const fileWatcher = new FileWatcher(projectPath);

      // Verify project has required files
      expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'src'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'vite.config.ts'))).toBe(true);

      const hash = fileWatcher.calculateProjectHash();
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });
  });

  describe('Package.json Analysis', () => {
    it('should detect different project types correctly', () => {
      const projects = [
        { name: 'test-node', expectedDeps: ['express'] },
        { name: 'test-react', expectedDeps: ['react', 'react-dom'] },
        { name: 'test-vue', expectedDeps: ['vue'] }
      ];

      projects.forEach(({ name, expectedDeps }) => {
        const projectPath = path.join(examplesDir, name);
        const packageJson = JSON.parse(
          fs.readFileSync(path.join(projectPath, 'package.json'), 'utf-8')
        );

        expectedDeps.forEach(dep => {
          expect(
            packageJson.dependencies?.[dep] || 
            packageJson.devDependencies?.[dep]
          ).toBeDefined();
        });
      });
    });
  });
});