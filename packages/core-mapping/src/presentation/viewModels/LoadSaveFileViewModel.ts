import {SaveValidationMessageViewModel} from "./SaveFileValidationViewModel";

export interface LoadSaveFileViewModel {
  status: 'idle' | 'invalid' | 'valid';
  errors: SaveValidationMessageViewModel[];
  warnings: SaveValidationMessageViewModel[];
}
