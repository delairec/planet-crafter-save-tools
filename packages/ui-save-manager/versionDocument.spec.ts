import {describe, expect, it} from 'bun:test';
import {writeVersionDocument} from './versionDocument.ts';

describe('writeVersionDocument', () => {

  describe('When Netlify names the commit it builds', () => {
    it('should carry the version and that commit', () => {
      // Arrange
      const commitReference = '5a31590c4e2f';

      // Act
      const versionDocument = writeVersionDocument('0.3.0', commitReference);

      // Assert
      expect(JSON.parse(versionDocument)).toEqual({version: '0.3.0', commit: '5a31590c4e2f'});
    });
  });

  describe('When the build names no commit', () => {
    it('should carry the version and a null commit', () => {
      // Arrange
      const noCommitReference = undefined;

      // Act
      const versionDocument = writeVersionDocument('0.3.0', noCommitReference);

      // Assert
      expect(JSON.parse(versionDocument)).toEqual({version: '0.3.0', commit: null});
    });
  });
});
