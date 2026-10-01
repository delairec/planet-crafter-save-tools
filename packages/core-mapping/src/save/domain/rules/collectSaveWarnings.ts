import {CarriedAndDeclaredReleases, detectDeclaredReleaseContradiction} from './detectDeclaredReleaseContradiction';
import {GameReleaseValueObject} from '../valueObjects/GameReleaseValueObject';
import type {SaveWarning} from '../validation/SaveWarning';

export function collectSaveWarnings(
  validation: CarriedAndDeclaredReleases & {readonly warnings: readonly SaveWarning[]},
  gameReleases: readonly GameReleaseValueObject[]
): SaveWarning[] {
  const contradiction = detectDeclaredReleaseContradiction(validation, gameReleases);

  if (contradiction === null) {
    return [...validation.warnings];
  }

  return [...validation.warnings, {code: 'declared-release-contradicts-content', ...contradiction}];
}
