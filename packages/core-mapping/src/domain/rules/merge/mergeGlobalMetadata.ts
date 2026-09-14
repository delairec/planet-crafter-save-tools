import {GlobalMetadata} from 'shared-save-processing/gameDefinitions';

const DEFAULT_METADATA: GlobalMetadata = {
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
  const metadataAOrDefault = metadataA ?? DEFAULT_METADATA;
  const metadataBOrDefault = metadataB ?? DEFAULT_METADATA;
  const openedInstanceSource = metadataA ?? metadataB;

  const deduplicatedUnlockedGroups = new Set([
    ...metadataAOrDefault.unlockedGroups.split(','),
    ...metadataBOrDefault.unlockedGroups.split(','),
  ]);

  return {
    terraTokens: metadataAOrDefault.terraTokens + metadataBOrDefault.terraTokens,
    allTimeTerraTokens: metadataAOrDefault.allTimeTerraTokens + metadataBOrDefault.allTimeTerraTokens,
    unlockedGroups: Array.from(deduplicatedUnlockedGroups).filter(Boolean).join(','),
    openedInstanceSeed: openedInstanceSource.openedInstanceSeed,
    openedInstanceTimeLeft: openedInstanceSource.openedInstanceTimeLeft,
  };
}
