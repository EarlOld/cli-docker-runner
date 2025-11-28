import { FileWatcher } from '../fileWatcher';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');

describe('FileWatcher', () => {
  const mockWorkDir = '/mock/project';
  let watcher: FileWatcher;

  beforeEach(() => {
    watcher = new FileWatcher(mockWorkDir);
    jest.clearAllMocks();
  });

  describe('calculateProjectHash', () => {
    it('should calculate hash from package.json', () => {
      (fs.existsSync as jest.Mock).mockImplementation((filePath: string) => {
        return filePath.includes('package.json');
      });

      (fs.readFileSync as jest.Mock).mockReturnValue('{"name": "test"}');
      (fs.readdirSync as jest.Mock).mockReturnValue(['package.json']);
      (fs.statSync as jest.Mock).mockReturnValue({ isFile: () => true });

      const hash = watcher.calculateProjectHash();

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA256 hex length
    });

    it('should include package-lock.json if exists', () => {
      (fs.existsSync as jest.Mock).mockImplementation((filePath: string) => {
        return filePath.includes('package.json') || filePath.includes('package-lock.json');
      });

      (fs.readFileSync as jest.Mock).mockReturnValue('{"name": "test"}');
      (fs.readdirSync as jest.Mock).mockReturnValue(['package.json', 'package-lock.json']);
      (fs.statSync as jest.Mock).mockReturnValue({ isFile: () => true });

      const hash = watcher.calculateProjectHash();

      expect(hash).toBeDefined();
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('package-lock.json'),
        'utf-8'
      );
    });
  });

  describe('saveHash and getSavedHash', () => {
    it('should save hash to file', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('{"name": "test"}');
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
      (fs.readdirSync as jest.Mock).mockReturnValue([]);

      watcher.saveHash();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockWorkDir, '.docker-runner-hash'),
        expect.any(String),
        'utf-8'
      );
    });

    it('should retrieve saved hash', () => {
      const testHash = 'abcdef123456';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(testHash);

      const hash = watcher.getSavedHash();

      expect(hash).toBe(testHash);
    });

    it('should return null if hash file does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const hash = watcher.getSavedHash();

      expect(hash).toBeNull();
    });
  });

  describe('hasChanges', () => {
    it('should return true if no saved hash exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const hasChanges = watcher.hasChanges();

      expect(hasChanges).toBe(true);
    });

    it('should return true if hash has changed', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce('old-hash')  // getSavedHash
        .mockReturnValueOnce('{"name": "test"}'); // calculateProjectHash
      (fs.readdirSync as jest.Mock).mockReturnValue([]);

      const hasChanges = watcher.hasChanges();

      expect(hasChanges).toBe(true);
    });

    it('should return false if hash has not changed', () => {
      const testHash = 'abc123';
      
      // Mock for getSavedHash
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(testHash);

      // Mock calculateProjectHash to return same hash
      jest.spyOn(watcher, 'calculateProjectHash').mockReturnValue(testHash);

      const hasChanges = watcher.hasChanges();

      expect(hasChanges).toBe(false);
    });
  });

  describe('dependency hash methods', () => {
    it('should calculate dependency hash from package files only', () => {
      (fs.existsSync as jest.Mock).mockImplementation((filePath: string) => {
        return filePath.includes('package.json') || filePath.includes('package-lock.json');
      });
      (fs.readFileSync as jest.Mock).mockReturnValue('{"dependencies": {}}');

      const hash = watcher.calculateDependencyHash();

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64);
    });

    it('should detect dependency changes when package.json changes', () => {
      // Mock existing dependency hash
      (fs.existsSync as jest.Mock).mockImplementation((filePath: string) => {
        if (filePath.includes('deps-hash')) return true;
        return filePath.includes('package.json');
      });
      (fs.readFileSync as jest.Mock).mockImplementation((filePath: string) => {
        if (filePath.includes('deps-hash')) return 'old-hash';
        return '{"dependencies": {"express": "^4.18.0"}}'; // New dependency
      });

      const hasChanges = watcher.hasDependencyChanges();

      expect(hasChanges).toBe(true);
    });

    it('should not detect changes when dependencies are same', () => {
      const testHash = 'same-dep-hash';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(testHash);
      jest.spyOn(watcher, 'calculateDependencyHash').mockReturnValue(testHash);

      const hasChanges = watcher.hasDependencyChanges();

      expect(hasChanges).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should remove both hash files', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

      watcher.cleanup();

      expect(fs.unlinkSync).toHaveBeenCalledWith(
        path.join(mockWorkDir, '.docker-runner-hash')
      );
      expect(fs.unlinkSync).toHaveBeenCalledWith(
        path.join(mockWorkDir, '.docker-runner-deps-hash')
      );
    });

    it('should not throw if files do not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      expect(() => watcher.cleanup()).not.toThrow();
    });
  });
});
