import {resolveCurrentGameRelease} from './resolveCurrentGameRelease';
import {resolveDeclaredGameRelease} from './resolveDeclaredGameRelease';
import {GameReleaseValueObject} from '../valueObjects/GameReleaseValueObject';

export function resolveGameReleaseOfDeclaredVersion(declaredVersion: string | undefined, gameReleases: readonly GameReleaseValueObject[]): string {
  const declaredRelease = declaredVersion === undefined ? undefined : resolveDeclaredGameRelease(declaredVersion, gameReleases);

  return declaredRelease?.release ?? resolveCurrentGameRelease(gameReleases);
}
