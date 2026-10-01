import {resolveCurrentGameRelease} from './resolveCurrentGameRelease';
import {resolveDeclaredGameRelease} from '../../../save/domain/rules/resolveDeclaredGameRelease';
import {GameReleaseValueObject} from '../../../save/domain/valueObjects/GameReleaseValueObject';

export function resolveGameReleaseOfDeclaredVersion(declaredVersion: string | undefined, gameReleases: readonly GameReleaseValueObject[]): string {
  const declaredRelease = declaredVersion === undefined ? undefined : resolveDeclaredGameRelease(declaredVersion, gameReleases);

  return declaredRelease?.release ?? resolveCurrentGameRelease(gameReleases);
}
