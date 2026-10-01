import {SaveValidationMessageViewModel} from "../../../save/presentation/viewModels/SaveValidationMessageViewModel";

export interface LoadSaveFileViewModel {
  status: 'idle' | 'invalid' | 'valid';
  errors: SaveValidationMessageViewModel[];
  warnings: SaveValidationMessageViewModel[];
}
