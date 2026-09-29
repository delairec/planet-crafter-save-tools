import {SaveWarning} from "shared-save-processing/gameDefinitions";

export interface SaveFilesWithoutUniqueHostResponse {
  saveAWrongHostCount?: number;
  saveBWrongHostCount?: number;
  saveAWarnings: SaveWarning[];
  saveBWarnings: SaveWarning[];
}
