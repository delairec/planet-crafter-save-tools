import type {UnreadableLineResponse} from "../../../save/application/responses/UnreadableLineResponse";
import type {SaveWarningResponse} from "../../../save/application/responses/SaveWarningResponse";

export interface SaveFileWithUnreadableLinesResponse {
  readonly unreadableLines: readonly UnreadableLineResponse[];
  readonly warnings: readonly SaveWarningResponse[];
}
