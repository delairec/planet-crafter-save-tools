import type {UnreadableLineResponse} from "../../../save/application/responses/UnreadableLineResponse";

export interface UnreadableLinesResponse {
  readonly unreadableLines: readonly UnreadableLineResponse[];
}
