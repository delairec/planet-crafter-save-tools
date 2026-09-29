import {SaveValidationMessageViewModel} from "./viewModels/SaveFileValidationViewModel";
import {invalidExtensionMessage} from "./messages/validationIssueMessages.js";

export function formatJsonExtensionError(): SaveValidationMessageViewModel {
  return {message: invalidExtensionMessage, location: null};
}
