export interface WorldEventEntry {
  readonly planet: number;
  readonly seed: number;
  readonly position: string;
  readonly owner?: number;
  readonly index?: number;
  readonly rotation?: string;
  readonly wrecksGenerated?: boolean;
  readonly generatedWorldObjectIds?: readonly number[];
  readonly droppedWorldObjectIds?: readonly number[];
  readonly version?: number;
}
