import type {DeclaredReleaseContradiction} from "../rules/detectDeclaredReleaseContradiction";

export type SaveWarning =
  | {readonly code: 'legacy-save-format'}
  | (DeclaredReleaseContradiction & {readonly code: 'declared-release-contradicts-content'});
