import type {SaveEntryField} from "../SaveSectionLocation";

export interface UnexpectedFieldIssue extends SaveEntryField {
  readonly code: 'unexpected-field';
  readonly unexpectedFieldName: string;
}
