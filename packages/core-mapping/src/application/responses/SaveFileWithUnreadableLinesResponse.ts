import type {UnreadableLineResponse} from "./UnreadableLineResponse";
import type {SaveWarningResponse} from "./SaveWarningResponse";

export interface SaveFileWithUnreadableLinesResponse {
  readonly unreadableLines: readonly UnreadableLineResponse[];
  readonly warnings: readonly SaveWarningResponse[];
}
