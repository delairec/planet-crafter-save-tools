import {ValidationIssue} from "../ports/ValidationIssue";
import {MergeWarning} from "./MergeWarning";
import {SaveWarning} from "shared-save-processing/gameDefinitions";

export interface MergeSucceededResponse {
  fileName: string;
  content: string;
  mergeErrors: ValidationIssue[];
  mergeWarnings: MergeWarning[];
  saveAWarnings: SaveWarning[];
  saveBWarnings: SaveWarning[];
}
