import {ValidationIssue, ValidationIssueCode} from "../application/ports/ValidationIssue";
import {
  formatFieldOfWrongTypeMessage,
  formatFloatSerializationMessage,
  formatMissingDependentFieldMessage,
  formatMissingFieldMessage,
  formatTooFewSectionEntriesMessage,
  formatUnexpectedFieldMessage,
  formatUnexpectedSectionCountMessage,
  formatUnreadableLineMessage,
  formatValueAboveMaximumMessage,
  formatValueBelowMinimumMessage,
  formatValueNotMatchingPatternMessage
} from "./messages/validationIssueMessages.js";

type ValidationIssueMessageFormatters = {
  [Code in ValidationIssueCode]: (issue: Extract<ValidationIssue, {code: Code}>) => string
};

const messageFormattersByIssueCode: ValidationIssueMessageFormatters = {
  'unexpected-section-count': formatUnexpectedSectionCountMessage,
  'too-few-section-entries': formatTooFewSectionEntriesMessage,
  'invalid-json': formatUnreadableLineMessage,
  'field-of-wrong-type': formatFieldOfWrongTypeMessage,
  'missing-field': formatMissingFieldMessage,
  'unexpected-field': formatUnexpectedFieldMessage,
  'value-below-minimum': formatValueBelowMinimumMessage,
  'value-above-maximum': formatValueAboveMaximumMessage,
  'value-not-matching-pattern': formatValueNotMatchingPatternMessage,
  'missing-dependent-field': formatMissingDependentFieldMessage,
  'float-serialization': formatFloatSerializationMessage
};

export function formatValidationIssue(issue: ValidationIssue): string {
  const formatMessage = messageFormattersByIssueCode[issue.code] as (issue: ValidationIssue) => string;

  return formatMessage(issue);
}
