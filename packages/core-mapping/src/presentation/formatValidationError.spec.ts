import {describe, expect, it} from 'bun:test';
import {formatValidationError} from './formatValidationError';
import {ValidationIssue} from '../application/ports/ValidationIssue';
import {SaveValidationMessageViewModel} from './viewModels/SaveFileValidationViewModel';

describe('formatValidationError', () => {

  describe('When the issue concerns the whole file', () => {
    it.each<[ValidationIssue, SaveValidationMessageViewModel]>([
      [
        {code: 'unexpected-section-count', foundSectionCount: 3, expectedSectionCounts: [11, 12]},
        {message: 'Expected 11 or 12 sections but found 3', location: null}
      ],
      [
        {code: 'float-serialization', fieldName: 'value', serializedValue: '-3'},
        {message: 'Field "value" has integer value serialized without .0 suffix (got: -3)', location: null}
      ]
    ])('should report the message of %p without any location', (issue, expectedError) => {
      // Act
      const error = formatValidationError(issue);

      // Assert
      expect<SaveValidationMessageViewModel>(error).toEqual(expectedError);
    });
  });

  describe('When the issue was found in a save entry', () => {
    it.each<[ValidationIssue, SaveValidationMessageViewModel]>([
      [
        {code: 'invalid-json', section: {name: 'worldObjects', index: 3}, entryIndex: 2, line: '{"id":1,'},
        {message: 'Invalid JSON: {"id":1,', location: 'World objects (section 3), entry 2'}
      ],
      [
        {code: 'schema-violation', section: {name: 'players', index: 2}, entryIndex: 3, fieldPath: '/name', schemaMessage: 'must be string'},
        {message: '/name must be string', location: 'Players (section 2), entry 3'}
      ]
    ])('should report the location of %p alongside its message', (issue, expectedError) => {
      // Act
      const error = formatValidationError(issue);

      // Assert
      expect<SaveValidationMessageViewModel>(error).toEqual(expectedError);
    });
  });

  describe('When the issue names a section but no entry', () => {
    it('should report the section alone', () => {
      // Act
      const error = formatValidationError({
        code: 'too-few-section-entries',
        section: {name: 'globalMetadata', index: 0},
        foundEntryCount: 0,
        minimumEntryCount: 1
      });

      // Assert
      expect<SaveValidationMessageViewModel>(error).toEqual({message: 'Expected at least 1 entry but found 0', location: 'Global metadata (section 0)'});
    });
  });

  describe('When the schema violation concerns the whole entry', () => {
    it('should show the message of the schema validator as it wrote it', () => {
      // Act
      const error = formatValidationError({
        code: 'schema-violation',
        section: {name: 'players', index: 2},
        entryIndex: 0,
        fieldPath: '',
        schemaMessage: "must have required property 'name'"
      });

      // Assert
      expect(error.message).toBe("must have required property 'name'");
    });
  });

  describe('When the unreadable line is longer than its reported head', () => {
    it('should show the first sixty characters of the line', () => {
      // Act
      const error = formatValidationError({
        code: 'invalid-json',
        section: {name: 'worldObjects', index: 3},
        entryIndex: 0,
        line: '{"id":123456789,"gId":"Iron","liId":0,"liGrps":"","pos":"1.0,2.0,3.0","rot":"0.0,0.0,0.0,1.0"'
      });

      // Assert
      expect(error.message).toBe('Invalid JSON: {"id":123456789,"gId":"Iron","liId":0,"liGrps":"","pos":"1.0');
    });
  });
});
