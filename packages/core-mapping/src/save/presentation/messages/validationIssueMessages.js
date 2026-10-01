const REPORTED_LINE_LENGTH = 60;

export const invalidExtensionMessage = 'Invalid file extension: expected a .json file.';

/**
 * @param {{foundSectionCount: number, expectedSectionCounts: number[]}} sectionCount
 * @returns {string}
 */
export function formatUnexpectedSectionCountMessage({foundSectionCount, expectedSectionCounts}) {
  return `Expected ${expectedSectionCounts.join(' or ')} sections but found ${foundSectionCount}`;
}

/**
 * @param {{foundEntryCount: number, minimumEntryCount: number}} entryCount
 * @returns {string}
 */
export function formatTooFewSectionEntriesMessage({foundEntryCount, minimumEntryCount}) {
  return `Expected at least ${minimumEntryCount} entry but found ${foundEntryCount}`;
}

/**
 * @param {{line: string}} invalidJsonLine
 * @returns {string}
 */
export function formatInvalidJsonMessage({line}) {
  return `Invalid JSON: ${line.slice(0, REPORTED_LINE_LENGTH)}`;
}

/**
 * @param {{line: string}} undecodableEntry
 * @returns {string}
 */
export function formatUndecodableEntryMessage({line}) {
  return `Entry the save format cannot decode: ${line.slice(0, REPORTED_LINE_LENGTH)}`;
}

/**
 * @param {string} fieldPath
 * @param {string} constraint
 * @returns {string}
 */
function formatEntryFieldMessage(fieldPath, constraint) {
  return `${fieldPath} ${constraint}`.trim();
}

/**
 * @param {{fieldPath: string, expectedType: string}} fieldOfWrongType
 * @returns {string}
 */
export function formatFieldOfWrongTypeMessage({fieldPath, expectedType}) {
  return formatEntryFieldMessage(fieldPath, `must be ${expectedType}`);
}

/**
 * @param {{fieldPath: string, missingFieldName: string}} missingField
 * @returns {string}
 */
export function formatMissingFieldMessage({fieldPath, missingFieldName}) {
  return formatEntryFieldMessage(fieldPath, `must have required property '${missingFieldName}'`);
}

/**
 * @param {{fieldPath: string}} unexpectedField
 * @returns {string}
 */
export function formatUnexpectedFieldMessage({fieldPath}) {
  return formatEntryFieldMessage(fieldPath, 'must NOT have additional properties');
}

/**
 * @param {{fieldPath: string, minimum: number}} valueBelowMinimum
 * @returns {string}
 */
export function formatValueBelowMinimumMessage({fieldPath, minimum}) {
  return formatEntryFieldMessage(fieldPath, `must be >= ${minimum}`);
}

/**
 * @param {{fieldPath: string, maximum: number}} valueAboveMaximum
 * @returns {string}
 */
export function formatValueAboveMaximumMessage({fieldPath, maximum}) {
  return formatEntryFieldMessage(fieldPath, `must be <= ${maximum}`);
}

/**
 * @param {{fieldPath: string, pattern: string}} valueNotMatchingPattern
 * @returns {string}
 */
export function formatValueNotMatchingPatternMessage({fieldPath, pattern}) {
  return formatEntryFieldMessage(fieldPath, `must match pattern "${pattern}"`);
}

/**
 * @param {{fieldPath: string, missingFieldName: string, dependingFieldName: string}} missingDependentField
 * @returns {string}
 */
export function formatMissingDependentFieldMessage({fieldPath, missingFieldName, dependingFieldName}) {
  return formatEntryFieldMessage(fieldPath, `must have property ${missingFieldName} when property ${dependingFieldName} is present`);
}

/**
 * @param {{fieldName: string, serializedValue: string}} floatSerialization
 * @returns {string}
 */
export function formatFloatSerializationMessage({fieldName, serializedValue}) {
  return `Field "${fieldName}" has integer value serialized without .0 suffix (got: ${serializedValue})`;
}
