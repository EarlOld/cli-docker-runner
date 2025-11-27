import { DockerManager } from '../dockerManager';
import { execSync } from 'child_process';

jest.mock('child_process');
jest.mock('chalk', () => ({
  __esModule: true,
  default: {
    blue: jest.fn((str) => str),
    green: jest.fn((str) => str),
    red: jest.fn((str) => str),
    yellow: jest.fn((str) => str),
  },
}));
jest.mock('ora', () => {
  return jest.fn(() => ({
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
  }));
});

// Suppress console output in tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('DockerManager', () => {
  const mockWorkDir = '/mock/project';
  let manager: DockerManager;

  beforeEach(() => {
    manager = new DockerManager(mockWorkDir);
    jest.clearAllMocks();
    // Reset execSync mock to default behavior
    (execSync as jest.Mock).mockImplementation(() => 'Success');
  });

  describe('checkDockerInstalled', () => {
    it('should return true when Docker is installed', () => {
      (execSync as jest.Mock).mockReturnValue('Docker version 24.0.0');

      const result = manager.checkDockerInstalled();

      expect(result).toBe(true);
      expect(execSync).toHaveBeenCalledWith('docker --version', { stdio: 'ignore' });
    });

    it('should return false when Docker is not installed', () => {
      (execSync as jest.Mock).mockImplementation(() => {
        throw new Error('Command not found');
      });

      const result = manager.checkDockerInstalled();

      expect(result).toBe(false);
    });
  });

  describe('buildImage', () => {
    it('should build Docker image successfully', () => {
      const dockerfilePath = '/mock/project/Dockerfile.tmp';
      const nodeVersion = '20';

      manager.buildImage(dockerfilePath, nodeVersion, false);

      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('docker build'),
        expect.objectContaining({
          stdio: 'inherit',
          cwd: mockWorkDir,
        })
      );
    });

    it('should use --no-cache flag when specified', () => {
      const dockerfilePath = '/mock/project/Dockerfile.tmp';
      const nodeVersion = '20';

      manager.buildImage(dockerfilePath, nodeVersion, true);

      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('--no-cache'),
        expect.any(Object)
      );
    });

    it('should throw error when build fails', () => {
      (execSync as jest.Mock).mockImplementation(() => {
        throw new Error('Build failed');
      });

      expect(() => manager.buildImage('/mock/Dockerfile', '20', false)).toThrow();
    });
  });

  describe('stopContainer', () => {
    it('should stop and remove container if it exists', () => {
      const containerName = 'test-container';
      
      (execSync as jest.Mock).mockImplementation(() => {
        // Don't throw for stop or rm commands
        return;
      });

      manager.stopContainer(containerName);

      expect(execSync).toHaveBeenCalledTimes(2);
      expect(execSync).toHaveBeenNthCalledWith(
        1,
        `docker stop ${containerName}`,
        { stdio: 'ignore' }
      );
      expect(execSync).toHaveBeenNthCalledWith(
        2,
        `docker rm ${containerName}`,
        { stdio: 'ignore' }
      );
    });

    it('should not throw error if container does not exist', () => {
      (execSync as jest.Mock).mockImplementation(() => {
        throw new Error('No such container');
      });

      expect(() => manager.stopContainer('non-existent')).not.toThrow();
    });
  });

  describe('installDependencies', () => {
    it('should install dependencies in Docker container', () => {
      const nodeVersion = '20';

      manager.installDependencies(nodeVersion);

      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('npm install'),
        expect.objectContaining({
          stdio: 'inherit',
          cwd: mockWorkDir,
        })
      );
    });

    it('should throw error when installation fails', () => {
      (execSync as jest.Mock).mockImplementation(() => {
        throw new Error('Installation failed');
      });

      expect(() => manager.installDependencies('20')).toThrow();
    });
  });

  describe('updateDependencies', () => {
    it('should update dependencies in Docker container', () => {
      const nodeVersion = '20';

      manager.updateDependencies(nodeVersion);

      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('npm update'),
        expect.objectContaining({
          stdio: 'inherit',
          cwd: mockWorkDir,
        })
      );
    });
  });

  describe('getImageName', () => {
    it('should return properly formatted image name', () => {
      const result = manager.getImageName('18');

      expect(result).toContain('-runner:node18');
    });
  });
});
