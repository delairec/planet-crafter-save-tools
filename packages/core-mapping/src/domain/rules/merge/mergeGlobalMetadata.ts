import {GlobalMetadata} from 'shared-save-processing/gameDefinitions';

const NO_METADATA_CONTRIBUTION: GlobalMetadata = {
  terraTokens: 0,
  allTimeTerraTokens: 0,
  unlockedGroups: '',
  openedInstanceSeed: 0,
  openedInstanceTimeLeft: 0,
};

/**
 * @see GR-META-1, GR-META-2, GR-META-3, GR-META-4 in docs/game-rules.md
 */
export function mergeGlobalMetadata([metadataA]: GlobalMetadata[], [metadataB]: GlobalMetadata[]): GlobalMetadata {
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
