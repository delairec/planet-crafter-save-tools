export interface EntriesByOrigin<TEntry> {
  readonly fromSaveA: readonly TEntry[];
  readonly fromSaveB: readonly TEntry[];
}
