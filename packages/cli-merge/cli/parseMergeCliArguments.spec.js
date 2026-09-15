import {describe, expect, it} from 'bun:test';
import {parseMergeCliArguments} from './parseMergeCliArguments.js';

const NO_ARGUMENTS = [];

describe('Merge CLI argument parsing', () => {
  describe('When no arguments are provided', () => {
    it('should default the input directory to "input"', () => {
      // Arrange
      const argv = NO_ARGUMENTS;

      // Act
      const {inputDir} = parseMergeCliArguments(argv);

      // Assert
      expect(inputDir).toBe('input');
    });

    it('should default the output directory to "output"', () => {
      // Arrange
      const argv = NO_ARGUMENTS;

      // Act
      const {outputDir} = parseMergeCliArguments(argv);

      // Assert
      expect(outputDir).toBe('output');
    });
  });

  describe('When an --input= argument is provided', () => {
    it('should use the provided input directory', () => {
      // Arrange
      const argv = ['--input=my-saves'];

      // Act
      const {inputDir} = parseMergeCliArguments(argv);

      // Assert
      expect(inputDir).toBe('my-saves');
    });
  });

  describe('When an --output= argument is provided', () => {
    it('should use the provided output directory', () => {
      // Arrange
      const argv = ['--output=merged-saves'];

      // Act
      const {outputDir} = parseMergeCliArguments(argv);

      // Assert
      expect(outputDir).toBe('merged-saves');
    });
  });

  describe('When both directories are provided', () => {
    it('should use each of them', () => {
      // Arrange
      const argv = ['--input=my-saves', '--output=merged-saves'];

      // Act
      const {inputDir, outputDir} = parseMergeCliArguments(argv);

      // Assert
      expect(inputDir).toBe('my-saves');
      expect(outputDir).toBe('merged-saves');
    });
  });

  describe('When a directory flag is repeated', () => {
    it('should use the directory of its first occurrence', () => {
      // Arrange
      const argv = ['--input=first-saves', '--input=second-saves'];

      // Act
      const {inputDir} = parseMergeCliArguments(argv);

      // Assert
      expect(inputDir).toBe('first-saves');
    });
  });

  describe('When a directory flag carries an empty value', () => {
    it('should take that empty directory rather than fall back on the default', () => {
      // Arrange
      const argv = ['--input='];

      // Act
      const {inputDir} = parseMergeCliArguments(argv);

      // Assert
      expect(inputDir).toBe('');
    });
  });

  describe('When a directory path holds an equals sign', () => {
    it('should take the path whole', () => {
      // Arrange
      const argv = ['--input=my=saves'];

      // Act
      const {inputDir} = parseMergeCliArguments(argv);

      // Assert
      expect(inputDir).toBe('my=saves');
    });
  });
});
