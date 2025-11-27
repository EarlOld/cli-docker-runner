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

  describe('Docker name sanitization', () => {
    it('should convert project name to lowercase', () => {
      const managerWithUpperCase = new DockerManager('/path/to/MyProject');
      const imageName = managerWithUpperCase.getImageName('20');

      expect(imageName).toBe('myproject-runner:node20');
      expect(imageName).not.toMatch(/[A-Z]/);
    });

    it('should replace invalid characters with dashes', () => {
      const managerWithSpecialChars = new DockerManager('/path/to/My_Project@123');
      const imageName = managerWithSpecialChars.getImageName('20');

      expect(imageName).toBe('my-project-123-runner:node20');
      expect(imageName).toMatch(/^[a-z0-9-]+:[a-z0-9]+$/);
    });

    it('should handle multiple consecutive invalid characters', () => {
      const managerWithMultipleChars = new DockerManager('/path/to/My___Project!!!');
      const imageName = managerWithMultipleChars.getImageName('20');

      expect(imageName).toBe('my---project----runner:node20');
      expect(imageName).not.toMatch(/[A-Z_!]/);
    });

    it('should work with already valid names', () => {
      const managerWithValidName = new DockerManager('/path/to/my-project-123');
      const imageName = managerWithValidName.getImageName('18');

      expect(imageName).toBe('my-project-123-runner:node18');
    });

    it('should generate valid Docker container name', () => {
      const managerWithMixedCase = new DockerManager('/path/to/Merchant-Office');
      
      // Simulate runContainer call
      managerWithMixedCase.runContainer('20', 'start', '3000', {});

      // Check that execSync was called with lowercase container name
      expect(execSync).toHaveBeenCalledWith(
        expect.stringMatching(/--name merchant-office-container/),
        expect.any(Object)
      );
    });

    it('should generate valid Docker image name in commands', () => {
      const managerWithMixedCase = new DockerManager('/path/to/Merchant-Office');
      
      // Simulate runContainer call
      managerWithMixedCase.runContainer('20', 'start', '3000', {});

      // Check that execSync was called with lowercase image name
      expect(execSync).toHaveBeenCalledWith(
        expect.stringMatching(/merchant-office-runner:node20/),
        expect.any(Object)
      );
    });
  });

  describe('Container reuse', () => {
    it('should check if container exists', () => {
      (execSync as jest.Mock).mockReturnValue('test-container\n');

      const exists = manager.containerExists('test-container');

      expect(exists).toBe(true);
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('docker ps -a --filter "name=test-container"'),
        expect.any(Object)
      );
    });

    it('should return false if container does not exist', () => {
      (execSync as jest.Mock).mockReturnValue('');

      const exists = manager.containerExists('test-container');

      expect(exists).toBe(false);
    });

    it('should check if container is running', () => {
      (execSync as jest.Mock).mockReturnValue('test-container\n');

      const isRunning = manager.containerIsRunning('test-container');

      expect(isRunning).toBe(true);
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('docker ps --filter "name=test-container"'),
        expect.any(Object)
      );
    });

    it('should check if image exists', () => {
      (execSync as jest.Mock).mockReturnValue('');

      const exists = manager.imageExists('test-image:latest');

      expect(exists).toBe(true);
      expect(execSync).toHaveBeenCalledWith(
        'docker image inspect test-image:latest',
        expect.any(Object)
      );
    });

    it('should restart existing container', () => {
      manager.restartContainer('test-container');

      expect(execSync).toHaveBeenCalledWith(
        'docker start -a test-container',
        expect.objectContaining({
          stdio: 'inherit',
        })
      );
    });

    it('should reuse stopped container on second run', () => {
      // Mock sequence: containerExists=true, containerIsRunning=false, then restart
      (execSync as jest.Mock).mockImplementation((cmd: string) => {
        // First call: docker ps -a (check if exists) - return container name
        if (cmd.includes('docker ps -a')) {
          return 'project-container\n';
        }
        // Second call: docker ps (check if running) - return empty (not running)
        if (cmd.includes('docker ps') && !cmd.includes('ps -a')) {
          return '';
        }
        // Third call should be docker start -a
        return '';
      });

      manager.runContainer('20', 'start', '3000', {});

      // Should call docker start -a (restart) instead of docker run (create new)
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('docker start -a'),
        expect.any(Object)
      );
      // Should NOT call docker run to create new container
      const dockerRunCalls = (execSync as jest.Mock).mock.calls.filter(
        call => call[0].includes('docker run')
      );
      expect(dockerRunCalls.length).toBe(0);
    });
  });
});
