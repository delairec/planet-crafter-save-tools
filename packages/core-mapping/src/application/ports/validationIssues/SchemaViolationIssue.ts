import type {SaveSectionLocation} from "../SaveSectionLocation";

export interface SchemaViolationIssue {
  readonly code: 'schema-violation';
  readonly section: SaveSectionLocation;
  readonly entryIndex: number;
  readonly fieldPath: string;
  readonly schemaMessage: string | undefined;
}
