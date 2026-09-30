import {ValidationIssue} from "../ports/ValidationIssue";
import type {SaveWarningResponse} from "./SaveWarningResponse";

export type SaveFileFindingsResponse =
  | {hasJsonExtension: false}
  | {hasJsonExtension: true; errors: ValidationIssue[]; warnings: SaveWarningResponse[]};
