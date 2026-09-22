import {describe, expect, it} from 'bun:test';
import {resolveGameRelease} from './gameReleases.js';

describe('resolveGameRelease', () => {
  describe('When the declared version is a release of the table or one after it', () => {
    it.each([
      ['1.618', '1.618'],
      ['2.004', '2.004'],
      ['2.008', '2.004'],
      ['2.102', '2.102'],
      ['2.103', '2.102']
    ])('should resolve %s to the last release not later than it, %s', (declaredVersion, expectedRelease) => {
      // Act
      const release = resolveGameRelease(declaredVersion);

      // Assert
      expect(release).toBe(expectedRelease);
    });
  });

  describe('When the declared version is earlier than the first release of the table', () => {
    it.each([
      ['1.0'],
      ['0.9.012']
    ])('should resolve %s to the first release, whose format earlier releases write', (declaredVersion) => {
      // Act
      const release = resolveGameRelease(declaredVersion);

      // Assert
      expect(release).toBe('1.618');
    });
  });

  describe('When the declared version is not made of dot-separated numbers', () => {
    it.each([
      ['v2.103'],
      [''],
      ['2..103']
    ])('should resolve %p to no release', (declaredVersion) => {
      // Act
      const release = resolveGameRelease(declaredVersion);

      // Assert
      expect(release).toBeUndefined();
    });
  });
});
