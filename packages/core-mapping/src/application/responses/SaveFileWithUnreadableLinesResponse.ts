import type {UnreadableLine} from "../../domain/save/SaveSectionLocation";
import type {SaveWarningResponse} from "./SaveWarningResponse";

export interface SaveFileWithUnreadableLinesResponse {
  unreadableLines: UnreadableLine[];
  warnings: SaveWarningResponse[];
}
