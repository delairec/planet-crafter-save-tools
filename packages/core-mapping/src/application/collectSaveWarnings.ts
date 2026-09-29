import type {SaveWarning} from "shared-save-processing/gameDefinitions";
import {SaveValidationResult} from "./ports/SaveValidationResult";
import {detectDeclaredReleaseContradiction} from "../domain/rules/detectDeclaredReleaseContradiction";
import {GameReleaseValueObject} from "../domain/valueObjects/GameReleaseValueObject";

export function collectSaveWarnings(validation: SaveValidationResult, gameReleases: readonly GameReleaseValueObject[]): SaveWarning[] {
  const contradiction = detectDeclaredReleaseContradiction(validation, gameReleases);

  if (contradiction === null) {
    return validation.warnings;
  }

  return [...validation.warnings, {code: 'declared-release-contradicts-content', ...contradiction}];
}
