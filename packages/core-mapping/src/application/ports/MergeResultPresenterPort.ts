import {ValidationIssue} from "./ValidationIssue";
import {SaveWarningCode} from "shared-save-processing/gameDefinitions";

export interface MergeResultPresenterPort {
  presentMergeSucceeded(fileName: string, content: string, saveAWarnings: SaveWarningCode[], saveBWarnings: SaveWarningCode[]): void;

  presentSaveFilesInvalid(saveAErrors: ValidationIssue[], saveBErrors: ValidationIssue[], saveAWarnings: SaveWarningCode[], saveBWarnings: SaveWarningCode[]): void;

  /**
   * The merge ran on two saves validation had accepted and ended without a save to hand back: the
   * failure was born of the merge itself, not of the files the user provided. An error carried by an
   * input file never reaches this outcome — validation refuses it before any merge, and
   * `presentSaveFilesInvalid` is what tells the user about it.
   */
  presentMergedSaveUnusable(): void;
}
