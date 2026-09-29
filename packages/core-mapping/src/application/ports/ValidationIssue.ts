import type {UnexpectedSectionCountIssue} from "./validationIssues/UnexpectedSectionCountIssue";
import type {TooFewSectionEntriesIssue} from "./validationIssues/TooFewSectionEntriesIssue";
import type {InvalidJsonIssue} from "./validationIssues/InvalidJsonIssue";
import type {FieldOfWrongTypeIssue} from "./validationIssues/FieldOfWrongTypeIssue";
import type {MissingFieldIssue} from "./validationIssues/MissingFieldIssue";
import type {UnexpectedFieldIssue} from "./validationIssues/UnexpectedFieldIssue";
import type {ValueBelowMinimumIssue} from "./validationIssues/ValueBelowMinimumIssue";
import type {ValueAboveMaximumIssue} from "./validationIssues/ValueAboveMaximumIssue";
import type {ValueNotMatchingPatternIssue} from "./validationIssues/ValueNotMatchingPatternIssue";
import type {MissingDependentFieldIssue} from "./validationIssues/MissingDependentFieldIssue";
import type {FloatSerializationIssue} from "./validationIssues/FloatSerializationIssue";

export type ValidationIssue =
  | UnexpectedSectionCountIssue
  | TooFewSectionEntriesIssue
  | InvalidJsonIssue
  | FieldOfWrongTypeIssue
  | MissingFieldIssue
  | UnexpectedFieldIssue
  | ValueBelowMinimumIssue
  | ValueAboveMaximumIssue
  | ValueNotMatchingPatternIssue
  | MissingDependentFieldIssue
  | FloatSerializationIssue;

export type ValidationIssueCode = ValidationIssue['code'];
