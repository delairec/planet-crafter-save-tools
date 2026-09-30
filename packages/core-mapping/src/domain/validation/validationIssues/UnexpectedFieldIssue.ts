import type {SaveEntryField} from "../../save/SaveSectionLocation";

export interface UnexpectedFieldIssue extends SaveEntryField {
  readonly code: 'unexpected-field';
  readonly unexpectedFieldName: string;
}
