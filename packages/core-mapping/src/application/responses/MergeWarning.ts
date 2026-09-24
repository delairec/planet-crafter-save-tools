import {SaveSectionName} from "shared-save-processing/gameDefinitions";

export type MergeWarning =
  | {code: 'merged-save-format'; formatRelease: string}
  | {code: 'merged-save-section-dropped'; section: SaveSectionName};
