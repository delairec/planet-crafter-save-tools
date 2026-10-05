export const powerPageDeficitBalance = 'Deficit';
export const powerPageTightBalance = 'Tight';
export const powerPageSurplusBalance = 'Surplus';
export const powerPageBalancedBalance = 'Balanced';
export const powerPageDeficitToneLabel = 'consumption exceeds production';
export const powerPageTightToneLabel = 'less than a tenth of production available';
export const powerPageSurplusToneLabel = 'production covers consumption';
export const powerPageBalancedToneLabel = 'no power produced nor consumed';
export const powerPageOptimizersTitle = 'Optimizers';
export const powerPageProducersTitle = 'Producers';
export const powerPageConsumersTitle = 'Consumers';
export const powerPageTotalLabel = 'Total';
const powerPageSummarySeparator = ' · ';

/** @param {string} share */
export const resolvePowerPageLoadMeterLabel = (share) => `${share} of production consumed`;

/** @param {number} count @param {string} singular @param {string} plural */
const countOf = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

/** @param {number} optimizerCount @param {string} boost */
export const resolvePowerPageOptimizersSummary = (optimizerCount, boost) => `${countOf(optimizerCount, 'optimizer', 'optimizers')}${powerPageSummarySeparator}boost ${boost}`;

/** @param {number} producerCount @param {number} consumerCount @param {number} optimizerCount */
export const resolvePowerPageBreakdownSummary = (producerCount, consumerCount, optimizerCount) => [
  countOf(producerCount, 'producer', 'producers'),
  countOf(consumerCount, 'consumer', 'consumers'),
  countOf(optimizerCount, 'optimizer', 'optimizers')
].join(powerPageSummarySeparator);
export const powerPageOptimizerBoostLabel = 'Optimizer boost';
export const powerPageFoldedTailLabel = 'Folded tail';

/** @param {number} typeCount */
export const resolvePowerPageFoldedTailBarLabel = (typeCount) => `Other (${countOf(typeCount, 'type', 'types')})`;

/** @param {number} typeCount @param {string} total */
export const resolvePowerPageChartSummary = (typeCount, total) => `${countOf(typeCount, 'type', 'types')}${powerPageSummarySeparator}${total}`;

/** @param {string} quantity @param {string} unitLevel @param {string} totalLevel */
export const resolvePowerPageMachineBarDetail = (quantity, unitLevel, totalLevel) => `${quantity} × ${unitLevel} = ${totalLevel}`;

/** @param {number} machineCount @param {string} totalLevel */
export const resolvePowerPageFoldedTailBarDetail = (machineCount, totalLevel) => `${countOf(machineCount, 'machine', 'machines')}${powerPageSummarySeparator}${totalLevel}`;

/** @param {number} optimizerCount @param {string} totalLevel */
export const resolvePowerPageOptimizerBoostBarDetail = (optimizerCount, totalLevel) => `${countOf(optimizerCount, 'optimizer', 'optimizers')}${powerPageSummarySeparator}${totalLevel}`;

/** @param {string} detail @param {string} share */
export const resolvePowerPageBarDetailWithShare = (detail, share) => `${detail}${powerPageSummarySeparator}${share} of production`;
