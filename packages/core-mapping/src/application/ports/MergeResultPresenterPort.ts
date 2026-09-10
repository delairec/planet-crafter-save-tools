import {ValidationIssue} from "./ValidationIssue";
import {SaveWarningCode} from "shared-save-processing/gameDefinitions";

export interface MergeSucceededOutcome {
  fileName: string;
  content: string;
  mergeErrors: ValidationIssue[];
  saveAWarnings: SaveWarningCode[];
  saveBWarnings: SaveWarningCode[];
}

export interface SaveFilesInvalidOutcome {
  saveAErrors: ValidationIssue[];
  saveBErrors: ValidationIssue[];
  saveAWarnings: SaveWarningCode[];
  saveBWarnings: SaveWarningCode[];
}

export interface MergeResultPresenterPort {
  presentMergeSucceeded(outcome: MergeSucceededOutcome): void;

  presentSaveFilesInvalid(outcome: SaveFilesInvalidOutcome): void;

  presentMergedSaveUnusable(): void;
}
