import type {GameReleaseRow} from './GameReleaseRow';
import gameReleases from './gameReleases.json' with {type: 'json'};

export function selectGameReleaseRows(): readonly GameReleaseRow[] {
  return gameReleases;
}
