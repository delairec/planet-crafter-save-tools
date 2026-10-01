import type {SaveSectionNameResponse} from "../../../save/application/responses/SaveSectionNameResponse";

export type MergeWarningResponse =
  | {readonly code: 'merged-save-format'; readonly formatRelease: string}
  | {readonly code: 'merged-save-section-dropped'; readonly section: SaveSectionNameResponse}
  | {readonly code: 'merged-save-content-newer-than-format'; readonly formatRelease: string; readonly contentRelease: string};
