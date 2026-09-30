import type {SaveSectionLocationResponse} from "./SaveSectionLocationResponse";

export interface UnreadableLineResponse {
  readonly code: 'invalid-json' | 'undecodable-entry';
  readonly section: SaveSectionLocationResponse;
  readonly entryIndex: number;
  readonly line: string;
}
