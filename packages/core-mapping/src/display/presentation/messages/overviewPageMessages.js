export const overviewPageAllTimeTerraTokensLabel = 'All time Terra Tokens';
export const overviewPageTerraTokenUnit = '=tt=';
export const overviewPageTotalCraftedObjectsLabel = 'Total crafted objects';
export const overviewPageDroneLogisticsLabel = 'Drone logistics';
export const overviewPageSystemTerraformationIndexLabel = 'System Terraformation Index';
export const overviewPageSystemTerraformationIndexUnit = 'SysTi';
export const overviewPageIdentityHintSeparator = ' · ';
export const overviewPagePlanetsTitle = 'Planets';
export const overviewPageNoMachinePlaced = 'No machine placed';
export const overviewPageNoTerraformationLevelRecorded = 'No terraformation level recorded';

/** @param {string} gameRelease */
export const resolveOverviewPageGameReleaseLabel = (gameRelease) => `Game release ${gameRelease}`;

/** @param {number} planetCount */
export const resolveOverviewPagePlanetsHint = (planetCount) => planetCount === 1 ? '1 planet' : `${planetCount} planets`;

/** @param {string} share */
export const resolveOverviewPageShareOfProductionConsumed = (share) => `${share} of production consumed`;

/** @param {number} planetCount */
export const resolveOverviewPageSystemTerraformationIndexCaption = (planetCount) => planetCount === 1 ? 'multiplied over 1 planet' : `multiplied over ${planetCount} planets`;
