import type {SaveSectionName} from '../../save/SaveSectionLocation';

export type MergeWarning =
  | {readonly code: 'merged-save-format'; readonly formatRelease: string}
  | {readonly code: 'merged-save-section-dropped'; readonly section: SaveSectionName}
  | {readonly code: 'merged-save-content-newer-than-format'; readonly formatRelease: string; readonly contentRelease: string};
