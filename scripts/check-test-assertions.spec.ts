import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from './testing/createFakeScriptIo.ts';
import {checkSpecFiles, findFabricatedBooleanAssertions} from './check-test-assertions.ts';

describe('findFabricatedBooleanAssertions', () => {

  describe('When an assertion builds a boolean with a predicate call', () => {
    it('should report the line and its text', () => {
      // Arrange
      const source = [
        'it(\'should reject the save\', () => {',
        '  expect(result.errors.some(error => error.section === 0)).toBeTruthy();',
        '});'
      ].join('\n');

      // Act
      const assertions = findFabricatedBooleanAssertions(source);

      // Assert
      expect(assertions).toEqual([
        {line: 2, text: 'expect(result.errors.some(error => error.section === 0)).toBeTruthy();'}
      ]);
    });
  });

  describe('When an assertion compares two values before the matcher', () => {
    it('should report the line', () => {
      // Arrange
      const source = 'expect(result.errors.length > 0).toBeTruthy();';

      // Act
      const assertions = findFabricatedBooleanAssertions(source);

      // Assert
      expect(assertions).toEqual([{line: 1, text: 'expect(result.errors.length > 0).toBeTruthy();'}]);
    });
  });

  describe('When an assertion uses the membership operator', () => {
    it('should report the line', () => {
      // Arrange
      const source = 'expect(\'isValid\' in result).toBeTruthy();';

      // Act
      const assertions = findFabricatedBooleanAssertions(source);

      // Assert
      expect(assertions).toEqual([{line: 1, text: 'expect(\'isValid\' in result).toBeTruthy();'}]);
    });
  });

  describe('When an assertion negates an expression', () => {
    it('should report the line', () => {
      // Arrange
      const source = 'expect(!result.errors.some(error => error.code === UNIQUE_HOST)).toBeTruthy();';

      // Act
      const assertions = findFabricatedBooleanAssertions(source);

      // Assert
      expect(assertions).toEqual([
        {line: 1, text: 'expect(!result.errors.some(error => error.code === UNIQUE_HOST)).toBeTruthy();'}
      ]);
    });
  });

  describe('When an assertion builds a boolean and expects it to be false', () => {
    it('should report the line', () => {
      // Arrange
      const source = 'expect(errors.includes(\'missing\')).toBe(false);';

      // Act
      const assertions = findFabricatedBooleanAssertions(source);

      // Assert
      expect(assertions).toEqual([{line: 1, text: 'expect(errors.includes(\'missing\')).toBe(false);'}]);
    });
  });

  describe('When an assertion applies a boolean matcher to a business boolean', () => {
    it('should report nothing', () => {
      // Arrange
      const source = [
        'expect(player.host).toBe(true);',
        'expect(result.isValid).toBe(false);',
        'expect(message.isRead).toBeTruthy();'
      ].join('\n');

      // Act
      const assertions = findFabricatedBooleanAssertions(source);

      // Assert
      expect(assertions).toEqual([]);
    });
  });

  describe('When a business boolean is reached through a callback', () => {
    it('should report nothing, the arrow not being a comparison', () => {
      // Arrange
      const source = 'expect(players.find(player => player.name).host).toBe(true);';

      // Act
      const assertions = findFabricatedBooleanAssertions(source);

      // Assert
      expect(assertions).toEqual([]);
    });
  });

  describe('When a comparison only appears inside a callback of the asserted expression', () => {
    it('should report nothing, the asserted value being the result of the call', () => {
      // Arrange
      const source = 'expect(players.find(player => player.id === 3)).toBeTruthy();';

      // Act
      const assertions = findFabricatedBooleanAssertions(source);

      // Assert
      expect(assertions).toEqual([]);
    });
  });

  describe('When the asserted expression calls a generic function', () => {
    it('should report nothing, the type arguments not being a comparison', () => {
      // Arrange
      const source = 'expect(readSetting<boolean>(\'host\')).toBe(true);';

      // Act
      const assertions = findFabricatedBooleanAssertions(source);

      // Assert
      expect(assertions).toEqual([]);
    });
  });

  describe('When a JSX element is passed to a call of the asserted expression', () => {
    it('should report nothing, its angle brackets not being a comparison', () => {
      // Arrange
      const source = 'expect(render(<SaveManager />).container).toBeTruthy();';

      // Act
      const assertions = findFabricatedBooleanAssertions(source);

      // Assert
      expect(assertions).toEqual([]);
    });
  });

  describe('When a built boolean is compared with a matcher other than a boolean one', () => {
    it('should report nothing, that matcher showing the actual value already', () => {
      // Arrange
      const source = 'expect(result.errors.length).toBeGreaterThan(0);';

      // Act
      const assertions = findFabricatedBooleanAssertions(source);

      // Assert
      expect(assertions).toEqual([]);
    });
  });

  describe('When a built boolean is nested in several parentheses', () => {
    it('should report the line, the matcher being read past the outermost one', () => {
      // Arrange
      const source = 'expect(Object.keys(groupBy(errors)).includes(\'section\')).toBeTruthy();';

      // Act
      const assertions = findFabricatedBooleanAssertions(source);

      // Assert
      expect(assertions).toEqual([
        {line: 1, text: 'expect(Object.keys(groupBy(errors)).includes(\'section\')).toBeTruthy();'}
      ]);
    });
  });

  describe('When an operator only appears inside a string literal', () => {
    it('should report nothing, a literal not being an expression', () => {
      // Arrange
      const source = [
        'expect(error.detail).toBe(\'/size must be >= 0\');',
        'expect(player.isHost).toBe(true); // the word in a comment is not an operator either'
      ].join('\n');

      // Act
      const assertions = findFabricatedBooleanAssertions(source);

      // Assert
      expect(assertions).toEqual([]);
    });
  });

  describe('When a parenthesis inside a string literal would unbalance the line', () => {
    it('should still report the built boolean', () => {
      // Arrange
      const source = 'expect(details.includes(\'(got: 280)\')).toBe(true);';

      // Act
      const assertions = findFabricatedBooleanAssertions(source);

      // Assert
      expect(assertions).toEqual([{line: 1, text: 'expect(details.includes(\'(got: 280)\')).toBe(true);'}]);
    });
  });

  describe('When an assertion is spread over several lines', () => {
    it('should report nothing, the matcher not being on the line of the expression', () => {
      // Arrange
      const sourceWithUnclosedExpect = [
        'expect(result.errors.some(',
        '  error => error.section === 0',
        ')).toBeTruthy();'
      ].join('\n');

      // Act
      const assertions = findFabricatedBooleanAssertions(sourceWithUnclosedExpect);

      // Assert
      expect(assertions).toEqual([]);
    });
  });

  describe('When a spec holds no assertion', () => {
    it('should report nothing', () => {
      // Arrange
      const sourceWithoutAssertion = 'const save = createFakeSaveContent();';

      // Act
      const assertions = findFabricatedBooleanAssertions(sourceWithoutAssertion);

      // Assert
      expect(assertions).toEqual([]);
    });
  });
});

describe('checkSpecFiles', () => {

  describe('When every spec of the repository applies its matcher to the value itself', () => {
    it('should print that nothing was found and exit with zero', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/core-mapping/src/mergePlayers.spec.ts': 'expect(result.errors).toEqual([]);'
        }
      });

      // Act
      await checkSpecFiles(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: ['check:assertions: no fabricated boolean assertion found.'],
        exitCodes: [0]
      });
    });
  });

  describe('When a spec applies its matcher to a boolean built from the value', () => {
    it('should print each offending line with its reason, then the count, and exit with one', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/core-mapping/src/mergePlayers.spec.ts': 'expect(result.errors).toEqual([]);\nexpect(result.errors.length > 0).toBeTruthy();'
        }
      });

      // Act
      await checkSpecFiles(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: [
          'packages/core-mapping/src/mergePlayers.spec.ts:2: expect(result.errors.length > 0).toBeTruthy();',
          'check:assertions: 1 fabricated boolean assertion(s); apply the matcher to the value itself.'
        ],
        exitCodes: [1]
      });
    });
  });
});
