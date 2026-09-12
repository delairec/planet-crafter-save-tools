import {SaveSections} from "../../domain/save/SaveSections";
import {SaveValidationMessageViewModel} from "./SaveFileValidationViewModel";

export interface LoadSaveFileViewModel {
  status: 'idle' | 'invalid' | 'valid';
  sections: SaveSections | null;
  errors: SaveValidationMessageViewModel[];
  warnings: SaveValidationMessageViewModel[];
}
