import type {SaveWarningResponse} from "./SaveWarningResponse";

export interface SaveFilesWithoutUniqueHostResponse {
  saveAWrongHostCount?: number;
  saveBWrongHostCount?: number;
  saveAWarnings: SaveWarningResponse[];
  saveBWarnings: SaveWarningResponse[];
}
