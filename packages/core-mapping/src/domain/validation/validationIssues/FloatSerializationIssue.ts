export interface FloatSerializationIssue {
  readonly code: 'float-serialization';
  readonly fieldName: string;
  readonly serializedValue: string;
}
