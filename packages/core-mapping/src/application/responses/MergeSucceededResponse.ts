import {ValidationIssue} from "../../domain/validation/ValidationIssue";
import {MergeWarning} from "../../domain/rules/merge/MergeWarning";
import type {SaveWarningResponse} from "./SaveWarningResponse";

export interface MergeSucceededResponse {
  fileName: string;
  content: string;
  mergeErrors: ValidationIssue[];
  mergeWarnings: readonly MergeWarning[];
  legacyFormatCouldBeKept: boolean;
  saveAWarnings: SaveWarningResponse[];
  saveBWarnings: SaveWarningResponse[];
}
