import {compareGameReleases} from './compareGameReleases';
import {GameReleaseValueObject} from '../valueObjects/GameReleaseValueObject';

const RELEASE_VERSION_PATTERN = /^\d+(\.\d+)*$/;

export function resolveDeclaredGameRelease(declaredVersion: string, gameReleases: readonly GameReleaseValueObject[]): GameReleaseValueObject | undefined {
  if (!RELEASE_VERSION_PATTERN.test(declaredVersion)) {
    return undefined;
  }

  const reachedReleases = gameReleases.filter(({release}) => compareGameReleases(release, declaredVersion) <= 0);

  return reachedReleases.at(-1) ?? gameReleases[0];
}
