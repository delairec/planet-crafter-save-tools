import {SaveValidationMessageViewModel} from "../../../save/presentation/viewModels/SaveValidationMessageViewModel";

export interface SaveFileValidationViewModel {
  status: 'idle' | 'valid' | 'invalid';
  errors: SaveValidationMessageViewModel[];
  warnings: SaveValidationMessageViewModel[];
}
