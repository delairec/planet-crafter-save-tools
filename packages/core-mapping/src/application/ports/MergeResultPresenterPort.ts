import {ValidationIssue} from "./ValidationIssue";
import {SaveWarningCode} from "shared-save-processing/gameDefinitions";

export interface MergeResultPresenterPort {
  presentMergeSucceeded(fileName: string, content: string, saveAWarnings: SaveWarningCode[], saveBWarnings: SaveWarningCode[]): void;

  presentSaveFilesInvalid(saveAErrors: ValidationIssue[], saveBErrors: ValidationIssue[], saveAWarnings: SaveWarningCode[], saveBWarnings: SaveWarningCode[]): void;
}
