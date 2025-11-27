import { EnvParser } from '../envParser';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('path');

describe('EnvParser', () => {
  const mockWorkDir = '/mock/project';
  let parser: EnvParser;

  beforeEach(() => {
    parser = new EnvParser(mockWorkDir);
    jest.clearAllMocks();
  });

  describe('parseEnvFile', () => {
    it('should parse env file successfully', () => {
      const mockEnvContent = 'API_KEY=secret123\nDATABASE_URL=postgres://localhost\nPORT=3000';
      
      (path.join as jest.Mock).mockReturnValue('/mock/project/.env');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockEnvContent);

      const result = parser.parseEnvFile();

      expect(result).toEqual({
        API_KEY: 'secret123',
        DATABASE_URL: 'postgres://localhost',
        PORT: '3000',
      });
    });

    it('should return empty object when env file does not exist', () => {
      (path.join as jest.Mock).mockReturnValue('/mock/project/.env');
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = parser.parseEnvFile();

      expect(result).toEqual({});
    });

    it('should parse custom env file', () => {
      const mockEnvContent = 'NODE_ENV=development';
      
      (path.join as jest.Mock).mockReturnValue('/mock/project/.env.development');
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockEnvContent);

      const result = parser.parseEnvFile('.env.development');

      expect(result).toEqual({
        NODE_ENV: 'development',
      });
    });
  });

  describe('findEnvFiles', () => {
    it('should find all existing env files', () => {
      (path.join as jest.Mock).mockImplementation((dir, file) => `${dir}/${file}`);
      (fs.existsSync as jest.Mock).mockImplementation((filePath) => {
        return filePath === '/mock/project/.env' || filePath === '/mock/project/.env.local';
      });

      const result = parser.findEnvFiles();

      expect(result).toEqual(['.env', '.env.local']);
    });

    it('should return empty array when no env files exist', () => {
      (path.join as jest.Mock).mockImplementation((dir, file) => `${dir}/${file}`);
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = parser.findEnvFiles();

      expect(result).toEqual([]);
    });
  });

  describe('formatEnvForDocker', () => {
    it('should format env vars for Docker command', () => {
      const envVars = {
        API_KEY: 'secret123',
        DATABASE_URL: 'postgres://localhost',
        PORT: '3000',
      };

      const result = parser.formatEnvForDocker(envVars);

      expect(result).toEqual([
        '-e API_KEY="secret123"',
        '-e DATABASE_URL="postgres://localhost"',
        '-e PORT="3000"',
      ]);
    });

    it('should escape quotes in values', () => {
      const envVars = {
        MESSAGE: 'Hello "World"',
      };

      const result = parser.formatEnvForDocker(envVars);

      expect(result).toEqual(['-e MESSAGE="Hello \\"World\\""']);
    });

    it('should handle empty env vars', () => {
      const result = parser.formatEnvForDocker({});

      expect(result).toEqual([]);
    });
  });
});
