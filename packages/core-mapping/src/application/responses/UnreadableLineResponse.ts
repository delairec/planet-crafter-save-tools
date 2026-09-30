import type {SaveSectionLocationResponse} from "./SaveSectionLocationResponse";

export interface UnreadableLineResponse {
  readonly section: SaveSectionLocationResponse;
  readonly entryIndex: number;
  readonly line: string;
}
