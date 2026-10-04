import {describe, expect, it} from 'bun:test';
import {formatSystemTerraformationIndex} from "./formatSystemTerraformationIndex";

const nbsp = ' ';

describe('formatSystemTerraformationIndex', () => {
  it('should write the SysTi in the unit of the game, its short-scale prefix glued to SysTi', () => {
    // Act
    const systemTerraformationIndex = formatSystemTerraformationIndex(4.369e54);

    // Assert
    expect(systemTerraformationIndex).toBe(`4.369${nbsp}SpdSysTi`);
  });
});
