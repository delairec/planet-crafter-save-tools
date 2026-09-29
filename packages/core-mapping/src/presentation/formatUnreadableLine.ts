import {UnreadableLine} from "../application/ports/SaveSectionLocation";
import {SaveValidationMessageViewModel} from "./viewModels/SaveFileValidationViewModel";
import {formatErrorLocation} from "./formatErrorLocation";
import {formatUnreadableLineMessage} from "./messages/validationIssueMessages.js";

export function formatUnreadableLine(unreadableLine: UnreadableLine): SaveValidationMessageViewModel {
  return {message: formatUnreadableLineMessage(unreadableLine), location: formatErrorLocation(unreadableLine)};
}
