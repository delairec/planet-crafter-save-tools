import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {SaveValidationMessageViewModel} from "./viewModels/SaveFileValidationViewModel";
import {formatErrorLocation} from "./formatErrorLocation";

export function formatUnreadableLine(unreadableLine: SaveParseError): SaveValidationMessageViewModel {
  return {message: unreadableLine.detail, location: formatErrorLocation(unreadableLine)};
}
