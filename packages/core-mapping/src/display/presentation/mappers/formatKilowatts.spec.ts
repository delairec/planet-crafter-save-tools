import {describe, expect, it} from 'bun:test';
import {formatKilowatts} from './formatKilowatts';

describe('formatKilowatts', () => {
  it('should format the power in kilowatts with its unit after a non-breaking space', () => {
    // Act
    const formatted = formatKilowatts(1_297.25);

    // Assert
    expect(formatted).toBe('1,297.25 kW');
  });
});
