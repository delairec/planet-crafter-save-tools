import type {SaveSectionName} from "../../domain/save/SaveSectionLocation";

export type MergeWarningResponse =
  | {code: 'merged-save-format'; formatRelease: string}
  | {code: 'merged-save-section-dropped'; section: SaveSectionName}
  | {code: 'merged-save-content-newer-than-format'; formatRelease: string; contentRelease: string};
