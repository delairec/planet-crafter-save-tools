import {Statistics} from 'shared-save-processing/gameDefinitions';

const NO_STATISTICS_CONTRIBUTION: Statistics = {craftedObjects: 0, totalSaveFileLoad: 0, totalSaveFileTime: 0};

/**
 * @see @RULE.StatisticsAreSummed
 */
export function mergeStatistics([statisticsA]: Statistics[], [statisticsB]: Statistics[]): Statistics | undefined {
  if (!statisticsA && !statisticsB) {
    return undefined;
  }

  const statisticsAContribution = statisticsA ?? NO_STATISTICS_CONTRIBUTION;
  const statisticsBContribution = statisticsB ?? NO_STATISTICS_CONTRIBUTION;

  return {
    craftedObjects: statisticsAContribution.craftedObjects + statisticsBContribution.craftedObjects,
    totalSaveFileLoad: statisticsAContribution.totalSaveFileLoad + statisticsBContribution.totalSaveFileLoad,
    totalSaveFileTime: statisticsAContribution.totalSaveFileTime + statisticsBContribution.totalSaveFileTime,
  };
}
