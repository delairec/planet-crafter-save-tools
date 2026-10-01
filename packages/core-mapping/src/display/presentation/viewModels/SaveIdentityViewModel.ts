import {SaveValidationMessageViewModel} from "../../../save/presentation/viewModels/SaveValidationMessageViewModel";
export interface SaveIdentityViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
  fileName: string;
  displayName?: string;
  mode?: string;
  gameRelease?: string;
}
