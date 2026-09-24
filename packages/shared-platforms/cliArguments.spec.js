import {describe, expect, it} from 'bun:test';
import {findUnknownArguments, formatHelp, hasSwitch, PLATFORM_FLAG_NAME, readFlagValue} from './cliArguments.js';

const FILE_FLAG_NAME = 'file';
const VERSION_SWITCH_NAME = 'version';
const INPUT_FLAG_NAME = 'input';
const NO_ARGUMENTS = [];
const NO_KNOWN_FLAG_NAME = [];
const NO_KNOWN_SWITCH_NAME = [];

describe('CLI argument reading', () => {
  describe('When the flag is absent', () => {
    it('should report no value for it', () => {
      // Arrange
      const argv = ['bun', 'validate-cli.js'];

      // Act
      const value = readFlagValue(argv, FILE_FLAG_NAME);

      // Assert
      expect(value).toBeUndefined();
    });
  });

  describe('When the flag carries a value', () => {
    it('should read that value', () => {
      // Arrange
      const argv = ['bun', 'validate-cli.js', '--file=saves/Standard-1.json'];

      // Act
      const value = readFlagValue(argv, FILE_FLAG_NAME);

      // Assert
      expect(value).toBe('saves/Standard-1.json');
    });
  });

  describe('When the value of the flag holds an equals sign', () => {
    it('should read the value whole', () => {
      // Arrange
      const argv = ['bun', 'validate-cli.js', '--file=saves/a=b/Standard-1=copy.json'];

      // Act
      const value = readFlagValue(argv, FILE_FLAG_NAME);

      // Assert
      expect(value).toBe('saves/a=b/Standard-1=copy.json');
    });
  });

  describe('When the flag carries an empty value', () => {
    it('should read that empty value', () => {
      // Arrange
      const argv = ['bun', 'validate-cli.js', '--file='];

      // Act
      const value = readFlagValue(argv, FILE_FLAG_NAME);

      // Assert
      expect(value).toBe('');
    });
  });

  describe('When the flag is repeated', () => {
    it('should read the value of its first occurrence', () => {
      // Arrange
      const argv = ['--file=first.json', '--file=second.json'];

      // Act
      const value = readFlagValue(argv, FILE_FLAG_NAME);

      // Assert
      expect(value).toBe('first.json');
    });
  });

  describe('When another flag starts with the same letters', () => {
    it('should not read the value of that other flag', () => {
      // Arrange
      const argv = ['--filename=Standard-1.json'];

      // Act
      const value = readFlagValue(argv, FILE_FLAG_NAME);

      // Assert
      expect(value).toBeUndefined();
    });
  });

  it('should name the platform flag every command of the repository accepts', () => {
    // Assert
    expect(PLATFORM_FLAG_NAME).toBe('platform');
  });
});

describe('CLI unknown argument detection', () => {
  describe('When every dash-prefixed argument names a known flag', () => {
    it('should report no unknown argument', () => {
      // Arrange
      const argv = ['bun', 'merge-cli.js', '--input=saves', '--platform=node'];

      // Act
      const unknownArguments = findUnknownArguments(argv, {flagNames: [INPUT_FLAG_NAME, PLATFORM_FLAG_NAME], switchNames: NO_KNOWN_SWITCH_NAME});

      // Assert
      expect(unknownArguments).toEqual(NO_ARGUMENTS);
    });
  });

  describe('When a flag name is misspelled', () => {
    it('should report that argument', () => {
      // Arrange
      const argv = ['--inpt=saves'];

      // Act
      const unknownArguments = findUnknownArguments(argv, {flagNames: [INPUT_FLAG_NAME], switchNames: NO_KNOWN_SWITCH_NAME});

      // Assert
      expect(unknownArguments).toEqual(['--inpt=saves']);
    });
  });

  describe('When a known flag comes without its equals sign', () => {
    it('should report that argument', () => {
      // Arrange
      const argv = ['--input', 'saves'];

      // Act
      const unknownArguments = findUnknownArguments(argv, {flagNames: [INPUT_FLAG_NAME], switchNames: NO_KNOWN_SWITCH_NAME});

      // Assert
      expect(unknownArguments).toEqual(['--input']);
    });
  });

  describe('When several arguments name no known flag', () => {
    it('should report them in the order they were given', () => {
      // Arrange
      const argv = ['-i', 'saves', '--output'];

      // Act
      const unknownArguments = findUnknownArguments(argv, {flagNames: [INPUT_FLAG_NAME], switchNames: NO_KNOWN_SWITCH_NAME});

      // Assert
      expect(unknownArguments).toEqual(['-i', '--output']);
    });
  });

  describe('When the command knows no flag at all', () => {
    it('should report every dash-prefixed argument', () => {
      // Arrange
      const argv = ['bun', 'merge-cli.js', '--input=saves'];

      // Act
      const unknownArguments = findUnknownArguments(argv, {flagNames: NO_KNOWN_FLAG_NAME, switchNames: NO_KNOWN_SWITCH_NAME});

      // Assert
      expect(unknownArguments).toEqual(['--input=saves']);
    });
  });

  describe('When a known switch is given', () => {
    it('should report no unknown argument', () => {
      // Arrange
      const argv = ['bun', 'merge-cli.js', '--version'];

      // Act
      const unknownArguments = findUnknownArguments(argv, {flagNames: NO_KNOWN_FLAG_NAME, switchNames: [VERSION_SWITCH_NAME]});

      // Assert
      expect(unknownArguments).toEqual(NO_ARGUMENTS);
    });
  });

  describe('When a known switch comes with a value', () => {
    it('should report that argument', () => {
      // Arrange
      const argv = ['--version=2'];

      // Act
      const unknownArguments = findUnknownArguments(argv, {flagNames: NO_KNOWN_FLAG_NAME, switchNames: [VERSION_SWITCH_NAME]});

      // Assert
      expect(unknownArguments).toEqual(['--version=2']);
    });
  });

  describe('When an argument extends the name of a known switch', () => {
    it('should report that argument', () => {
      // Arrange
      const argv = ['--version-full'];

      // Act
      const unknownArguments = findUnknownArguments(argv, {flagNames: NO_KNOWN_FLAG_NAME, switchNames: [VERSION_SWITCH_NAME]});

      // Assert
      expect(unknownArguments).toEqual(['--version-full']);
    });
  });
});

describe('CLI switch reading', () => {
  describe('When the switch is given', () => {
    it('should report it present', () => {
      // Arrange
      const argv = ['bun', 'merge-cli.js', '--version'];

      // Act
      const isPresent = hasSwitch(argv, VERSION_SWITCH_NAME);

      // Assert
      expect(isPresent).toBe(true);
    });
  });

  describe('When the switch is absent', () => {
    it('should report it absent', () => {
      // Arrange
      const argv = ['bun', 'merge-cli.js', '--input=saves'];

      // Act
      const isPresent = hasSwitch(argv, VERSION_SWITCH_NAME);

      // Assert
      expect(isPresent).toBe(false);
    });
  });

  describe('When the switch comes with a value', () => {
    it('should report it absent', () => {
      // Arrange
      const argv = ['--version=2'];

      // Act
      const isPresent = hasSwitch(argv, VERSION_SWITCH_NAME);

      // Assert
      expect(isPresent).toBe(false);
    });
  });

  describe('When another switch starts with the same letters', () => {
    it('should report the switch absent', () => {
      // Arrange
      const argv = ['--version-full'];

      // Act
      const isPresent = hasSwitch(argv, VERSION_SWITCH_NAME);

      // Assert
      expect(isPresent).toBe(false);
    });
  });
});

describe('CLI help formatting', () => {
  describe('When the command accepts flags and switches', () => {
    it('should name the invocation, then one aligned line per flag and per switch', () => {
      // Arrange
      const commandArguments = {
        invocation: 'bun merge -- [options]',
        flags: [
          {name: 'input', valueName: 'directory', description: 'read the saves from this directory'},
          {name: 'platform', valueName: 'bun|node', description: 'reserved to the node:* scripts'}
        ],
        switches: [{name: 'version', description: 'print the version and exit'}]
      };

      // Act
      const help = formatHelp(commandArguments);

      // Assert
      expect(help).toBe(`Usage: bun merge -- [options]

Options:
  --input=<directory>    read the saves from this directory
  --platform=<bun|node>  reserved to the node:* scripts
  --version              print the version and exit`);
    });
  });

  describe('When the command accepts no switch', () => {
    it('should list its flags alone', () => {
      // Arrange
      const noSwitch = [];
      const commandArguments = {
        invocation: 'bun validate -- --file=<path>',
        flags: [{name: 'file', valueName: 'path', description: 'the save file to validate'}],
        switches: noSwitch
      };

      // Act
      const help = formatHelp(commandArguments);

      // Assert
      expect(help).toBe(`Usage: bun validate -- --file=<path>

Options:
  --file=<path>  the save file to validate`);
    });
  });
});
