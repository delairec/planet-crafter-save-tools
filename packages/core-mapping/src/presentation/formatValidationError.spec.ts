import {describe, expect, it} from 'bun:test';
import {formatValidationError} from './formatValidationError';
import {ValidationIssue} from '../domain/validation/ValidationIssue';
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
        {code: 'field-of-wrong-type', section: {name: 'players', index: 2}, entryIndex: 3, fieldPath: '/name', expectedType: 'string'},
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

  describe('When the entry breaks a constraint of its schema', () => {
    it.each<[ValidationIssue, string]>([
      [
        {code: 'field-of-wrong-type', section: {name: 'players', index: 2}, entryIndex: 0, fieldPath: '/playerGaugeOxygen', expectedType: 'number'},
        '/playerGaugeOxygen must be number'
      ],
      [
        {code: 'missing-field', section: {name: 'players', index: 2}, entryIndex: 0, fieldPath: '/inventory', missingFieldName: 'size'},
        "/inventory must have required property 'size'"
      ],
      [
        {code: 'unexpected-field', section: {name: 'players', index: 2}, entryIndex: 0, fieldPath: '/inventory', unexpectedFieldName: 'opacity'},
        '/inventory must NOT have additional properties'
      ],
      [
        {code: 'value-below-minimum', section: {name: 'players', index: 2}, entryIndex: 0, fieldPath: '/playerGaugeOxygen', minimum: 0},
        '/playerGaugeOxygen must be >= 0'
      ],
      [
        {code: 'value-above-maximum', section: {name: 'players', index: 2}, entryIndex: 0, fieldPath: '/playerGaugeOxygen', maximum: 100},
        '/playerGaugeOxygen must be <= 100'
      ],
      [
        {code: 'value-not-matching-pattern', section: {name: 'players', index: 2}, entryIndex: 0, fieldPath: '/playerPosition', pattern: '^-?[0-9]+$'},
        '/playerPosition must match pattern "^-?[0-9]+$"'
      ],
      [
        {code: 'missing-dependent-field', section: {name: 'players', index: 2}, entryIndex: 0, fieldPath: '/linkedObject', missingFieldName: 'liId', dependingFieldName: 'liPlanet'},
        '/linkedObject must have property liId when property liPlanet is present'
      ]
    ])('should show the path of the field followed by the constraint of %p', (issue, expectedMessage) => {
      // Act
      const error = formatValidationError(issue);

      // Assert
      expect(error.message).toBe(expectedMessage);
    });
  });

  describe('When the constraint concerns the whole entry', () => {
    it('should show the constraint alone', () => {
      // Act
      const error = formatValidationError({
        code: 'missing-field',
        section: {name: 'players', index: 2},
        entryIndex: 0,
        fieldPath: '',
        missingFieldName: 'name'
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
