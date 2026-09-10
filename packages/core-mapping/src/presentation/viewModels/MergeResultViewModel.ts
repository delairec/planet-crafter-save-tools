import {SaveValidationMessageViewModel} from "./SaveFileValidationViewModel";

/**
 * What a merge run ended up as. `'validationError'` speaks of the input files, refused before any
 * merge; `'mergeFailed'` speaks of the merge itself, which ran and produced nothing usable, and is
 * the only status carrying `mergeFailureMessage`. On both, `fileName` and `content` stay empty:
 * there is no save to hand back.
 */
export interface MergeResultViewModel {
  status: 'idle' | 'success' | 'validationError' | 'mergeFailed';
  fileName: string;
  content: string;
  mergeFailureMessage: string;
  saveAErrors: SaveValidationMessageViewModel[];
  saveBErrors: SaveValidationMessageViewModel[];
  saveAWarnings: SaveValidationMessageViewModel[];
  saveBWarnings: SaveValidationMessageViewModel[];
}
