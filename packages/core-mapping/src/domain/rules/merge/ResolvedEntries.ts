import {EntriesByOrigin} from './EntriesByOrigin';

export interface ResolvedEntries<TEntry> {
  readonly entries: EntriesByOrigin<TEntry>;
  readonly saveBIdRemapping: ReadonlyMap<number, number>;
}
