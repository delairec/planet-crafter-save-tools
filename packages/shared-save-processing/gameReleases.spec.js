import {describe, expect, it} from 'bun:test';
import {compareGameReleases, resolveGameRelease} from './gameReleases.js';

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

describe('compareGameReleases', () => {
  describe('When the first release is earlier than the second', () => {
    it.each([
      ['1.618', '2.004'],
      ['2.004', '2.102'],
      ['2.004', '2.0041']
    ])('should rank %s before %s', (earlierRelease, laterRelease) => {
      // Act
      const comparison = compareGameReleases(earlierRelease, laterRelease);

      // Assert
      expect(comparison).toBeLessThan(0);
    });
  });

  describe('When the first release is later than the second', () => {
    it('should rank it after', () => {
      // Act
      const comparison = compareGameReleases('2.004', '1.618');

      // Assert
      expect(comparison).toBeGreaterThan(0);
    });
  });

  describe('When both name the same release', () => {
    it('should rank them equal', () => {
      // Act
      const comparison = compareGameReleases('2.004', '2.004');

      // Assert
      expect(comparison).toBe(0);
    });
  });
});
