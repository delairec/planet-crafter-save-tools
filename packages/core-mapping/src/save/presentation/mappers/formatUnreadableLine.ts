import type {UnreadableLineResponse} from "../../application/responses/UnreadableLineResponse";
import {SaveValidationMessageViewModel} from "../viewModels/SaveValidationMessageViewModel";
import {formatErrorLocation} from "./formatErrorLocation";
import {formatInvalidJsonMessage, formatUndecodableEntryMessage} from "../messages/validationIssueMessages.js";

const UNREADABLE_LINE_MESSAGES = {
  'invalid-json': formatInvalidJsonMessage,
  'undecodable-entry': formatUndecodableEntryMessage
};

export function formatUnreadableLine(unreadableLine: UnreadableLineResponse): SaveValidationMessageViewModel {
  return {message: UNREADABLE_LINE_MESSAGES[unreadableLine.code](unreadableLine), location: formatErrorLocation(unreadableLine)};
}
