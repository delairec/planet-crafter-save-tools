import type {ValidationIssueResponse} from "../../application/responses/ValidationIssueResponse";
import {
  formatFieldOfWrongTypeMessage,
  formatFloatSerializationMessage,
  formatMissingDependentFieldMessage,
  formatMissingFieldMessage,
  formatTooFewSectionEntriesMessage,
  formatUnexpectedFieldMessage,
  formatUnexpectedSectionCountMessage,
  formatInvalidJsonMessage,
  formatValueAboveMaximumMessage,
  formatValueBelowMinimumMessage,
  formatValueNotMatchingPatternMessage
} from "../messages/validationIssueMessages.js";

type ValidationIssueMessageFormatters = {
  [Code in ValidationIssueResponse['code']]: (issue: Extract<ValidationIssueResponse, {code: Code}>) => string
};

const messageFormattersByIssueCode: ValidationIssueMessageFormatters = {
  'unexpected-section-count': formatUnexpectedSectionCountMessage,
  'too-few-section-entries': formatTooFewSectionEntriesMessage,
  'invalid-json': formatInvalidJsonMessage,
  'field-of-wrong-type': formatFieldOfWrongTypeMessage,
  'missing-field': formatMissingFieldMessage,
  'unexpected-field': formatUnexpectedFieldMessage,
  'value-below-minimum': formatValueBelowMinimumMessage,
  'value-above-maximum': formatValueAboveMaximumMessage,
  'value-not-matching-pattern': formatValueNotMatchingPatternMessage,
  'missing-dependent-field': formatMissingDependentFieldMessage,
  'float-serialization': formatFloatSerializationMessage
};

export function formatValidationIssue(issue: ValidationIssueResponse): string {
  const formatMessage = messageFormattersByIssueCode[issue.code] as (issue: ValidationIssueResponse) => string;

  return formatMessage(issue);
}
