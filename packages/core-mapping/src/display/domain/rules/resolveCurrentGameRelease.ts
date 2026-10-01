import {GameReleaseValueObject} from '../../../save/domain/valueObjects/GameReleaseValueObject';

export function resolveCurrentGameRelease(gameReleases: readonly GameReleaseValueObject[]): string {
  return gameReleases.at(-1)?.release ?? '';
}
