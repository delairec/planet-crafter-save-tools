import {SaveValidationMessageViewModel} from "./SaveFileValidationViewModel";
export interface SaveIdentityViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
  fileName: string;
  displayName?: string;
  mode?: string;
  gameRelease?: string;
}
