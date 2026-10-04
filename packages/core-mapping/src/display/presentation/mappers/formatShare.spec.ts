import {describe, expect, it} from 'bun:test';
import {formatShare} from './formatShare';

describe('formatShare', () => {
  it('should write a share of production as a percentage', () => {
    // Act
    const share = formatShare(0.8);

    // Assert
    expect<string>(share).toBe('80%');
  });
});
