import {GameReleasesReaderPort} from '../application/ports/GameReleasesReaderPort';
import {GAME_RELEASES} from './gameReleasesFixture';

export function stubGameReleasesReader(): GameReleasesReaderPort {
  return {readGameReleases: () => GAME_RELEASES};
}
