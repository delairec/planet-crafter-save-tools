import {SaveValidationMessageViewModel} from "./viewModels/SaveValidationMessageViewModel";
import {invalidExtensionMessage} from "./messages/validationIssueMessages.js";

export function formatJsonExtensionError(): SaveValidationMessageViewModel {
  return {message: invalidExtensionMessage, location: null};
}
