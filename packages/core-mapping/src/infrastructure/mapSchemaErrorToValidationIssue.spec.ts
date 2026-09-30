import {describe, expect, it} from 'bun:test';
import {mapSchemaErrorToValidationIssue, SectionEntrySchemaError} from './mapSchemaErrorToValidationIssue';
import {UnknownSchemaConstraintError} from './errors/UnknownSchemaConstraintError';
import {ValidationIssue} from '../domain/validation/ValidationIssue';
import {SaveSectionLocation} from '../domain/save/SaveSectionLocation';

const playersSection: SaveSectionLocation = {name: 'players', index: 2};
const fourthEntry = 3;
const firstEntry = 0;

describe('mapSchemaErrorToValidationIssue', () => {

  describe('When the schema validator reports a constraint a validation issue states', () => {
    it.each<[string, SectionEntrySchemaError, ValidationIssue]>([
      [
        'a field of the wrong type',
        {instancePath: '/name', keyword: 'type', params: {type: 'string'}},
        {code: 'field-of-wrong-type', section: {name: 'players', index: 2}, entryIndex: 3, fieldPath: '/name', expectedType: 'string'}
      ],
      [
        'a missing field',
        {instancePath: '', keyword: 'required', params: {missingProperty: 'host'}},
        {code: 'missing-field', section: {name: 'players', index: 2}, entryIndex: 3, fieldPath: '', missingFieldName: 'host'}
      ],
      [
        'a field the schema does not declare',
        {instancePath: '', keyword: 'additionalProperties', params: {additionalProperty: 'opacity'}},
        {code: 'unexpected-field', section: {name: 'players', index: 2}, entryIndex: 3, fieldPath: '', unexpectedFieldName: 'opacity'}
      ],
      [
        'a value below its minimum',
        {instancePath: '/playerGaugeOxygen', keyword: 'minimum', params: {comparison: '>=', limit: 0}},
        {code: 'value-below-minimum', section: {name: 'players', index: 2}, entryIndex: 3, fieldPath: '/playerGaugeOxygen', minimum: 0}
      ],
      [
        'a value above its maximum',
        {instancePath: '/playerGaugeOxygen', keyword: 'maximum', params: {comparison: '<=', limit: 100}},
        {code: 'value-above-maximum', section: {name: 'players', index: 2}, entryIndex: 3, fieldPath: '/playerGaugeOxygen', maximum: 100}
      ],
      [
        'a value that does not match its pattern',
        {instancePath: '/playerPosition', keyword: 'pattern', params: {pattern: '^-?[0-9]+$'}},
        {code: 'value-not-matching-pattern', section: {name: 'players', index: 2}, entryIndex: 3, fieldPath: '/playerPosition', pattern: '^-?[0-9]+$'}
      ],
      [
        'a field missing beside the field that requires it',
        {instancePath: '', keyword: 'dependencies', params: {property: 'liPlanet', missingProperty: 'liId', depsCount: 1, deps: 'liId'}},
        {code: 'missing-dependent-field', section: {name: 'players', index: 2}, entryIndex: 3, fieldPath: '', missingFieldName: 'liId', dependingFieldName: 'liPlanet'}
      ]
    ])('should state %s as its own issue, at the field and the entry it concerns', (_constraint, schemaError, expectedIssue) => {
      // Act
      const issue = mapSchemaErrorToValidationIssue(schemaError, playersSection, fourthEntry);

      // Assert
      expect<ValidationIssue>(issue).toEqual(expectedIssue);
    });
  });

  describe('When the schema validator reports a constraint no validation issue states', () => {
    it('should fail with an UnknownSchemaConstraintError', () => {
      // Arrange
      const formatError: SectionEntrySchemaError = {instancePath: '/name', keyword: 'format', params: {format: 'date-time'}};

      // Act
      const mapping = () => mapSchemaErrorToValidationIssue(formatError, playersSection, firstEntry);

      // Assert
      expect(mapping).toThrow(UnknownSchemaConstraintError);
    });
  });
});
