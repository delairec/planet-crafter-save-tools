import {ValidationIssue} from "../ports/ValidationIssue";
import {MergeWarningResponse} from "./MergeWarningResponse";
import type {SaveWarning} from "shared-save-processing/gameDefinitions";

export interface MergeSucceededResponse {
  fileName: string;
  content: string;
  mergeErrors: ValidationIssue[];
  mergeWarnings: MergeWarningResponse[];
  legacyFormatCouldBeKept: boolean;
  saveAWarnings: SaveWarning[];
  saveBWarnings: SaveWarning[];
}
