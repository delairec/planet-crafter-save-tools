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
export const powerPageSummarySeparator = ' · ';

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
