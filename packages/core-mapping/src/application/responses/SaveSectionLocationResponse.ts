import type {SaveSectionNameResponse} from "./SaveSectionNameResponse";

export const RESERVED_SAVE_PART = 'reserved';

export interface SaveSectionLocationResponse {
  readonly name: SaveSectionNameResponse | typeof RESERVED_SAVE_PART;
  readonly index: number;
}
