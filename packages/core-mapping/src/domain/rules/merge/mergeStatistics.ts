import {Statistics} from 'shared-save-processing/gameDefinitions';

const DEFAULT_STATISTICS: Statistics = {craftedObjects: 0, totalSaveFileLoad: 0, totalSaveFileTime: 0};

/**
 * @see GR-STAT-1 in docs/game-rules.md
 */
export function mergeStatistics([statisticsA]: Statistics[], [statisticsB]: Statistics[]): Statistics | undefined {
  if (!statisticsA && !statisticsB) {
    return undefined;
  }

  const statisticsAOrDefault = statisticsA ?? DEFAULT_STATISTICS;
  const statisticsBOrDefault = statisticsB ?? DEFAULT_STATISTICS;

  return {
    craftedObjects: statisticsAOrDefault.craftedObjects + statisticsBOrDefault.craftedObjects,
    totalSaveFileLoad: statisticsAOrDefault.totalSaveFileLoad + statisticsBOrDefault.totalSaveFileLoad,
    totalSaveFileTime: statisticsAOrDefault.totalSaveFileTime + statisticsBOrDefault.totalSaveFileTime,
  };
}
