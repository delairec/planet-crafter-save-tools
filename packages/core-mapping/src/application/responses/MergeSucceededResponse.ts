import {ValidationIssue} from "../ports/ValidationIssue";
import {MergeWarning} from "./MergeWarning";
import type {SaveWarning} from "shared-save-processing/gameDefinitions";

export interface MergeSucceededResponse {
  fileName: string;
  content: string;
  mergeErrors: ValidationIssue[];
  mergeWarnings: MergeWarning[];
  legacyFormatCouldBeKept: boolean;
  saveAWarnings: SaveWarning[];
  saveBWarnings: SaveWarning[];
}
