import {compareGameReleases} from '../../../save/domain/rules/compareGameReleases';
import {SaveSections} from '../../../save/domain/save/SaveSections';

export function selectWrittenFormatSave(mainSave: SaveSections, secondarySave: SaveSections, preferLegacyFormat: boolean): SaveSections {
  if (mainSave.formatRelease === secondarySave.formatRelease) {
    return mainSave;
  }

  const [earlierSave, laterSave] = compareGameReleases(mainSave.formatRelease, secondarySave.formatRelease) < 0
    ? [mainSave, secondarySave]
    : [secondarySave, mainSave];

  return preferLegacyFormat ? earlierSave : laterSave;
}
