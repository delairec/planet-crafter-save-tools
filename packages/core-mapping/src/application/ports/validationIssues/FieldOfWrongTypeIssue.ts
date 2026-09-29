import type {SaveEntryField} from "../SaveSectionLocation";

export interface FieldOfWrongTypeIssue extends SaveEntryField {
  readonly code: 'field-of-wrong-type';
  readonly expectedType: string;
}
