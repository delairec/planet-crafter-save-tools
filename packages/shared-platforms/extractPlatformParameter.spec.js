import {describe, expect, it} from 'bun:test';
import {extractPlatformParameter, SUPPORTED_PLATFORMS} from './extractPlatformParameter.js';

describe('extractPlatformParameter', () => {

  it('should support bun and node, the two platforms the cases below enumerate', () => {
    // Assert
    expect(SUPPORTED_PLATFORMS).toEqual(['bun', 'node']);
  });

  describe('When --platform is absent', () => {
    it('should return bun, the default platform', () => {
      // Arrange
      const argv = ['script.js'];

      // Act
      const platform = extractPlatformParameter(argv);

      // Assert
      expect(platform).toBe('bun');
    });
  });

  describe('When --platform is present', () => {
    it.each(['bun', 'node'])('should return %s as the platform name', (expectedPlatform) => {
      // Arrange
      const argv = ['script.js', `--platform=${expectedPlatform}`];

      // Act
      const platform = extractPlatformParameter(argv);

      // Assert
      expect(platform).toBe(expectedPlatform);
    });
  });

  describe('When --platform is invalid', () => {
    it('should throw an error listing the supported platforms', () => {
      // Arrange
      const argv = ['script.js', '--platform=invalidPlatform'];

      // Act
      const execute = () => extractPlatformParameter(argv);

      // Assert
      expect(execute).toThrow('Invalid platform: invalidPlatform. Supported platforms: bun, node.');
    });
  });
});
