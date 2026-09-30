import {ValidationIssue} from "../domain/validation/ValidationIssue";
import {SaveValidationMessageViewModel} from "./viewModels/SaveFileValidationViewModel";
import {formatValidationIssue} from "./formatValidationIssue";
import {formatErrorLocation} from "./formatErrorLocation";

export function formatValidationError(issue: ValidationIssue): SaveValidationMessageViewModel {
  return {message: formatValidationIssue(issue), location: 'section' in issue ? formatErrorLocation(issue) : null};
}
