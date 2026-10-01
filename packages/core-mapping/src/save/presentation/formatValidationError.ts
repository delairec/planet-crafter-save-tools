import type {ValidationIssueResponse} from "../application/responses/ValidationIssueResponse";
import {SaveValidationMessageViewModel} from "./viewModels/SaveValidationMessageViewModel";
import {formatValidationIssue} from "./formatValidationIssue";
import {formatErrorLocation} from "./formatErrorLocation";

export function formatValidationError(issue: ValidationIssueResponse): SaveValidationMessageViewModel {
  return {message: formatValidationIssue(issue), location: 'section' in issue ? formatErrorLocation(issue) : null};
}
