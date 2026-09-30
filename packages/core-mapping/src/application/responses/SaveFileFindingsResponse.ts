import {ValidationIssue} from "../ports/ValidationIssue";
import type {SaveWarning} from "shared-save-processing/gameDefinitions";

export type SaveFileFindingsResponse =
  | {hasJsonExtension: false}
  | {hasJsonExtension: true; errors: ValidationIssue[]; warnings: SaveWarning[]};
