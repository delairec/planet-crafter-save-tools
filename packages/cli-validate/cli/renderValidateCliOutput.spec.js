import {afterEach, beforeEach, describe, expect, it, spyOn} from 'bun:test';
import {renderUnexpectedError} from './renderValidateCliOutput.js';

describe('renderUnexpectedError', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('When the failure is an error', () => {
    it('should print its message on stderr', () => {
      // Arrange
      const failure = new Error('EACCES: permission denied');

      // Act
      renderUnexpectedError(failure);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: EACCES: permission denied');
    });
  });

  describe('When the failure is not an error', () => {
    it('should print it as text on stderr', () => {
      // Arrange
      const failure = 'disk full';

      // Act
      renderUnexpectedError(failure);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: disk full');
    });
  });
});
