import {describe, expect, it} from 'bun:test';
import {formatNumberBySystemTerraformationIndexThresholds} from './systemTerraformationIndex.strategy';

const nbsp = ' ';

describe('formatNumberBySystemTerraformationIndexThresholds', () => {
  it('should format the value without a prefix below the first threshold', () => {
    // Act
    const result = formatNumberBySystemTerraformationIndexThresholds(450);

    // Assert
    expect(result).toBe(`450${nbsp}`);
  });

  it.each([
    [450_000, `450${nbsp}k`],
    [1e20, `100${nbsp}Qi`],
    [1.5e31, `15${nbsp}No`],
    [5e36, `5${nbsp}Ud`],
    [4.369e54, `4.369${nbsp}Spd`],
    [1e110, `100${nbsp}Qitg`]
  ])('should express %p with the largest short-scale prefix the game uses that it reaches', (value, expected) => {
    // Act
    const result = formatNumberBySystemTerraformationIndexThresholds(value);

    // Assert
    expect(result).toBe(expected);
  });
});
