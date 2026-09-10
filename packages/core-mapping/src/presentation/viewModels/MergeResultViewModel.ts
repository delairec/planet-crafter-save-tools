import {SaveValidationMessageViewModel} from "./SaveFileValidationViewModel";

export interface MergeResultViewModel {
  status: 'idle' | 'success' | 'validationError' | 'mergeFailed';
  fileName: string;
  content: string;
  mergeFailureMessage: string;
  mergedSaveErrors: SaveValidationMessageViewModel[];
  saveAErrors: SaveValidationMessageViewModel[];
  saveBErrors: SaveValidationMessageViewModel[];
  saveAWarnings: SaveValidationMessageViewModel[];
  saveBWarnings: SaveValidationMessageViewModel[];
}
