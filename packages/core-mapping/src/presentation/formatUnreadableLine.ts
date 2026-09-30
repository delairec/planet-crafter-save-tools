import type {UnreadableLineResponse} from "../application/responses/UnreadableLineResponse";
import {SaveValidationMessageViewModel} from "./viewModels/SaveFileValidationViewModel";
import {formatErrorLocation} from "./formatErrorLocation";
import {formatUnreadableLineMessage} from "./messages/validationIssueMessages.js";

export function formatUnreadableLine(unreadableLine: UnreadableLineResponse): SaveValidationMessageViewModel {
  return {message: formatUnreadableLineMessage(unreadableLine), location: formatErrorLocation(unreadableLine)};
}
