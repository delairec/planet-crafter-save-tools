import {SaveValidationMessageViewModel} from "./viewModels/SaveFileValidationViewModel";
import {formatUniqueHostMessage} from "./messages/uniqueHostMessages.js";

export function formatUniqueHostError(hostCount: number): SaveValidationMessageViewModel {
  return {message: formatUniqueHostMessage(hostCount), location: null};
}
