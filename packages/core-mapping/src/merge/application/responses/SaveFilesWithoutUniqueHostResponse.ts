import type {SaveWarningResponse} from "../../../save/application/responses/SaveWarningResponse";

export interface SaveFilesWithoutUniqueHostResponse {
  saveAWrongHostCount?: number;
  saveBWrongHostCount?: number;
  saveAWarnings: SaveWarningResponse[];
  saveBWarnings: SaveWarningResponse[];
}
