import {GlobalMetadata} from 'shared-save-processing/gameDefinitions';
import {NoGlobalMetadataToMergeError} from '../../errors/NoGlobalMetadataToMergeError';

const NO_METADATA_CONTRIBUTION: GlobalMetadata = {
  terraTokens: 0,
  allTimeTerraTokens: 0,
  unlockedGroups: '',
  openedInstanceSeed: 0,
  openedInstanceTimeLeft: 0,
};

/**
 * @see @RULE.GlobalMetadataIsSummedAndUnioned
 */
export function mergeGlobalMetadata([metadataA]: GlobalMetadata[], [metadataB]: GlobalMetadata[]): GlobalMetadata {
  if (metadataA === undefined && metadataB === undefined) {
    throw new NoGlobalMetadataToMergeError();
  }

  const metadataAContribution = metadataA ?? NO_METADATA_CONTRIBUTION;
  const metadataBContribution = metadataB ?? NO_METADATA_CONTRIBUTION;
  const openedInstanceSource = metadataA ?? metadataB;

  const deduplicatedUnlockedGroups = new Set([
    ...metadataAContribution.unlockedGroups.split(','),
    ...metadataBContribution.unlockedGroups.split(','),
  ]);

  return {
    terraTokens: metadataAContribution.terraTokens + metadataBContribution.terraTokens,
    allTimeTerraTokens: metadataAContribution.allTimeTerraTokens + metadataBContribution.allTimeTerraTokens,
    unlockedGroups: Array.from(deduplicatedUnlockedGroups).filter(Boolean).join(','),
    openedInstanceSeed: openedInstanceSource.openedInstanceSeed,
    openedInstanceTimeLeft: openedInstanceSource.openedInstanceTimeLeft,
  };
}
