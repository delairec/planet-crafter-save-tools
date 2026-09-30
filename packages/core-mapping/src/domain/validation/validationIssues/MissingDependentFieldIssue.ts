import type {SaveEntryField} from "../../save/SaveSectionLocation";

export interface MissingDependentFieldIssue extends SaveEntryField {
  readonly code: 'missing-dependent-field';
  readonly missingFieldName: string;
  readonly dependingFieldName: string;
}
