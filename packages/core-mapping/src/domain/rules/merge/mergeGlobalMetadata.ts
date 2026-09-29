import {GlobalMetadataEntry} from '../../save/GlobalMetadataEntry';
import {NoGlobalMetadataToMergeError} from '../../errors/NoGlobalMetadataToMergeError';

const NO_METADATA_CONTRIBUTION: GlobalMetadataEntry = {
  terraTokens: 0,
  allTimeTerraTokens: 0,
  unlockedGroups: [],
  openedInstanceSeed: 0,
  openedInstanceTimeLeft: 0,
};

/**
 * @see @RULE.GlobalMetadataIsSummedAndUnioned
 */
export function mergeGlobalMetadata([metadataA]: readonly GlobalMetadataEntry[], [metadataB]: readonly GlobalMetadataEntry[]): GlobalMetadataEntry {
  if (metadataA === undefined && metadataB === undefined) {
    throw new NoGlobalMetadataToMergeError();
  }

  const metadataAContribution = metadataA ?? NO_METADATA_CONTRIBUTION;
  const metadataBContribution = metadataB ?? NO_METADATA_CONTRIBUTION;
  const openedInstanceSource = metadataA ?? metadataB;
  const logisticsPaused = metadataA?.logisticsPaused ?? metadataB?.logisticsPaused;

  const deduplicatedUnlockedGroups = new Set([
    ...metadataAContribution.unlockedGroups,
    ...metadataBContribution.unlockedGroups,
  ]);

  return {
    terraTokens: metadataAContribution.terraTokens + metadataBContribution.terraTokens,
    allTimeTerraTokens: metadataAContribution.allTimeTerraTokens + metadataBContribution.allTimeTerraTokens,
    unlockedGroups: Array.from(deduplicatedUnlockedGroups),
    openedInstanceSeed: openedInstanceSource.openedInstanceSeed,
    openedInstanceTimeLeft: openedInstanceSource.openedInstanceTimeLeft,
    ...(logisticsPaused === undefined ? {} : {logisticsPaused}),
  };
}
