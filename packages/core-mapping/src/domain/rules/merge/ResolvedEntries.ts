import {EntriesByOrigin} from './EntriesByOrigin';

/**
 * Entries of one section once their identifier conflicts are resolved, together with the
 * identifiers the save B entries were given.
 *
 * The remapping only holds save B entries: save A identifiers are authoritative and never change,
 * so a reference coming from save A never has to be rewritten.
 *
 * @see @RULE.DuplicateIdentifiersAreRemappedOnTheSaveBSide
 */
export interface ResolvedEntries<TEntry> {
  readonly entries: EntriesByOrigin<TEntry>;
  readonly saveBIdRemapping: ReadonlyMap<number, number>;
}
