import {ValidationIssue, ValidationIssueCode} from "../application/ports/ValidationIssue";
import {
  formatFloatSerializationMessage,
  formatSchemaViolationMessage,
  formatTooFewSectionEntriesMessage,
  formatUnexpectedSectionCountMessage,
  formatUnreadableLineMessage,
  invalidExtensionMessage
} from "./messages/validationIssueMessages.js";

type ValidationIssueMessageFormatters = {
  [Code in ValidationIssueCode]: (issue: Extract<ValidationIssue, {code: Code}>) => string
};

const messageFormattersByIssueCode: ValidationIssueMessageFormatters = {
  'invalid-extension': () => invalidExtensionMessage,
  'unexpected-section-count': formatUnexpectedSectionCountMessage,
  'too-few-section-entries': formatTooFewSectionEntriesMessage,
  'invalid-json': formatUnreadableLineMessage,
  'schema-violation': formatSchemaViolationMessage,
  'float-serialization': formatFloatSerializationMessage
};

export function formatValidationIssue(issue: ValidationIssue): string {
  const formatMessage = messageFormattersByIssueCode[issue.code] as (issue: ValidationIssue) => string;

  return formatMessage(issue);
}
