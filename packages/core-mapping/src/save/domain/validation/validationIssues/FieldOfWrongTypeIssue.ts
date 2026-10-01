import type {SaveEntryField} from "../../save/SaveSectionLocation";

export interface FieldOfWrongTypeIssue extends SaveEntryField {
  readonly code: 'field-of-wrong-type';
  readonly expectedType: string;
}
