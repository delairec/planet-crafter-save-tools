import {compareGameReleases} from 'shared-save-processing/gameReleases.js';
import {SaveSections} from '../../save/SaveSections';

export function selectWrittenFormatSave(mainSave: SaveSections, secondarySave: SaveSections, preferLegacyFormat: boolean): SaveSections {
  if (mainSave.formatRelease === secondarySave.formatRelease) {
    return mainSave;
  }

  const [earlierSave, laterSave] = compareGameReleases(mainSave.formatRelease, secondarySave.formatRelease) < 0
    ? [mainSave, secondarySave]
    : [secondarySave, mainSave];

  return preferLegacyFormat ? earlierSave : laterSave;
}
