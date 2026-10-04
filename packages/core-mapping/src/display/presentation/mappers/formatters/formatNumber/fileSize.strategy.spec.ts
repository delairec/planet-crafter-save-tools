import {describe, expect, it} from 'bun:test';
import {formatNumberByFileSizeThresholds} from './fileSize.strategy';

const nbsp = '\u00A0';

describe('formatNumberByFileSizeThresholds', () => {
  it.each([
    [0, `0${nbsp}B`],
    [1_023, `1,023${nbsp}B`],
    [2_540, `2.48${nbsp}KB`],
    [1_048_576, `1${nbsp}MB`],
    [3_221_225_472, `3${nbsp}GB`]
  ])('should express %p bytes in the largest unit of 1,024 they reach', (bytes, expected) => {
    // Act
    const result = formatNumberByFileSizeThresholds(bytes);

    // Assert
    expect(result).toBe(expected);
  });
});
