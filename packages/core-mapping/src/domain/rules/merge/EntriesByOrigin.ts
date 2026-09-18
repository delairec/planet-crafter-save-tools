/**
 * Entries of a section that carries identifiers, kept grouped by the save they come from.
 *
 * Id conflict resolution needs that origin: save A entries keep their identifiers, save B entries
 * are the ones that get renumbered and whose references are rewritten.
 *
 * @see @RULE.DuplicateIdentifiersAreRemappedOnTheSaveBSide
 */
export interface EntriesByOrigin<TEntry> {
  readonly fromSaveA: readonly TEntry[];
  readonly fromSaveB: readonly TEntry[];
}
