/** The label of each world object, by world object name; a name the table does not label reads undefined. */
export type WorldObjectLabels = Readonly<Record<string, string>>;

export interface WorldObjectLabelsReaderPort {
  readWorldObjectLabels(): WorldObjectLabels;
}
