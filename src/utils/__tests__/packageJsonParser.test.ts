import { PackageJsonParser } from '../packageJsonParser';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('path');

describe('PackageJsonParser', () => {
  const mockWorkDir = '/mock/project';
  let parser: PackageJsonParser;

  beforeEach(() => {
    parser = new PackageJsonParser(mockWorkDir);
    jest.clearAllMocks();
  });

  describe('readPackageJson', () => {
    it('should read and parse package.json successfully', () => {
      const mockPackageJson = {
        name: 'test-project',
        version: '1.0.0',
        scripts: {
          start: 'node index.js',
          test: 'jest',
        },
      };

      (path.join as jest.Mock).mockReturnValue('/mock/project/package.json');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockPackageJson));

      const result = parser.readPackageJson();

      expect(result).toEqual(mockPackageJson);
      expect(fs.existsSync).toHaveBeenCalledWith('/mock/project/package.json');
    });

    it('should throw error when package.json does not exist', () => {
      (path.join as jest.Mock).mockReturnValue('/mock/project/package.json');
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      expect(() => parser.readPackageJson()).toThrow('package.json not found in current directory');
    });
  });

  describe('getScripts', () => {
    it('should return scripts from package.json', () => {
      const mockScripts = {
        start: 'node index.js',
        dev: 'nodemon index.js',
        test: 'jest',
      };

      (path.join as jest.Mock).mockReturnValue('/mock/project/package.json');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ scripts: mockScripts }));

      const result = parser.getScripts();

      expect(result).toEqual(mockScripts);
    });

    it('should return empty object when no scripts exist', () => {
      (path.join as jest.Mock).mockReturnValue('/mock/project/package.json');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ name: 'test' }));

      const result = parser.getScripts();

      expect(result).toEqual({});
    });
  });

  describe('getScriptNames', () => {
    it('should return array of script names', () => {
      const mockScripts = {
        start: 'node index.js',
        test: 'jest',
        build: 'tsc',
      };

      (path.join as jest.Mock).mockReturnValue('/mock/project/package.json');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ scripts: mockScripts }));

      const result = parser.getScriptNames();

      expect(result).toEqual(['start', 'test', 'build']);
    });
  });

  describe('hasScript', () => {
    beforeEach(() => {
      const mockScripts = {
        start: 'node index.js',
        test: 'jest',
      };

      (path.join as jest.Mock).mockReturnValue('/mock/project/package.json');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ scripts: mockScripts }));
    });

    it('should return true when script exists', () => {
      expect(parser.hasScript('start')).toBe(true);
      expect(parser.hasScript('test')).toBe(true);
    });

    it('should return false when script does not exist', () => {
      expect(parser.hasScript('build')).toBe(false);
      expect(parser.hasScript('deploy')).toBe(false);
    });
  });
});
