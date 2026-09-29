import type {UnexpectedSectionCountIssue} from "./validationIssues/UnexpectedSectionCountIssue";
import type {TooFewSectionEntriesIssue} from "./validationIssues/TooFewSectionEntriesIssue";
import type {InvalidJsonIssue} from "./validationIssues/InvalidJsonIssue";
import type {SchemaViolationIssue} from "./validationIssues/SchemaViolationIssue";
import type {FloatSerializationIssue} from "./validationIssues/FloatSerializationIssue";

export type ValidationIssue =
  | UnexpectedSectionCountIssue
  | TooFewSectionEntriesIssue
  | InvalidJsonIssue
  | SchemaViolationIssue
  | FloatSerializationIssue;

export type ValidationIssueCode = ValidationIssue['code'];
