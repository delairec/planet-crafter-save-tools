export interface WorldObjectLabelsReaderPort {
  readWorldObjectLabels(): Readonly<Record<string, string>>;
}
