import {ValidationIssue} from "../ports/ValidationIssue";
import {MergeWarningResponse} from "./MergeWarningResponse";
import type {SaveWarningResponse} from "./SaveWarningResponse";

export interface MergeSucceededResponse {
  fileName: string;
  content: string;
  mergeErrors: ValidationIssue[];
  mergeWarnings: MergeWarningResponse[];
  legacyFormatCouldBeKept: boolean;
  saveAWarnings: SaveWarningResponse[];
  saveBWarnings: SaveWarningResponse[];
}
