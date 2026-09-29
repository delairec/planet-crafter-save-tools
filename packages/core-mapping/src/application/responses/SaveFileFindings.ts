import {ValidationIssue} from "../ports/ValidationIssue";
import {SaveWarning} from "shared-save-processing/gameDefinitions";

export type SaveFileFindings =
  | {hasJsonExtension: false}
  | {hasJsonExtension: true; errors: ValidationIssue[]; warnings: SaveWarning[]};
