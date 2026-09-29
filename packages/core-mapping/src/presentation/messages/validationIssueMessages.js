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
 * @param {{line: string}} unreadableLine
 * @returns {string}
 */
export function formatUnreadableLineMessage({line}) {
  return `Invalid JSON: ${line.slice(0, REPORTED_LINE_LENGTH)}`;
}

/**
 * @param {{fieldPath: string, schemaMessage: string | undefined}} schemaViolation
 * @returns {string}
 */
export function formatSchemaViolationMessage({fieldPath, schemaMessage}) {
  return `${fieldPath} ${schemaMessage}`.trim();
}

/**
 * @param {{fieldName: string, serializedValue: string}} floatSerialization
 * @returns {string}
 */
export function formatFloatSerializationMessage({fieldName, serializedValue}) {
  return `Field "${fieldName}" has integer value serialized without .0 suffix (got: ${serializedValue})`;
}
