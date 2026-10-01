import {compareGameReleases} from '../../../save/domain/rules/compareGameReleases';
import {resolveCurrentGameRelease} from './resolveCurrentGameRelease';
import {GameReleaseValueObject} from '../../../save/domain/valueObjects/GameReleaseValueObject';

export function precedesCurrentGameRelease(release: string, gameReleases: readonly GameReleaseValueObject[]): boolean {
  return compareGameReleases(release, resolveCurrentGameRelease(gameReleases)) < 0;
}
