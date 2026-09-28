export const menuLabel = 'Menu';
export const breadcrumbLabel = 'Breadcrumb';
export const saveIdentityLabel = 'Loaded save';

export const toolsGroupTitle = 'Tools';
export const saveGroupTitle = 'Save';
export const playersGroupTitle = 'Players';

export const mergeTwoSavesPageTitle = 'Merge two saves';
export const loadSavePageTitle = 'Load save';
export const loadAnotherSavePageTitle = 'Load another save';
export const overviewPageTitle = 'Overview';
export const configurationPageTitle = 'Configuration';
export const powerPageTitle = 'Power';
export const terraformationPageTitle = 'Terraformation';
export const playersPageTitle = 'All players';
export const seeMorePlayersButtonLabel = 'See more';

export const homeMessageTitle = 'Message';
export const homeMessageBody = 'Welcome to the Planet Crafter Save Manager, prisoner. Use this dashboard to evaluate your progression with computed statistics, merge two saves, or simply validate your save integrity.';
export const homeMessageClosing = 'Keep up the good work!';
export const homeMessageSender = 'SENTINEL CORP';
export const openOverviewLinkLabel = 'Open the Overview';
export const unloadSaveButtonLabel = 'Unload save';
export const crossIcon = '✕';
export const homeMessageAttachmentsLabel = 'Merged saves';

/** @param {string} fileName */
export const resolveRemoveMergedSaveButtonLabel = (fileName) => `Remove ${fileName}`;

/** @param {string} fileName */
export const resolveLoadedSaveTitle = (fileName) => `Loaded save: ${fileName}`;

/** @param {boolean} isSaveLoaded */
export const resolveLoadSavePageTitle = (isSaveLoaded) => isSaveLoaded ? loadAnotherSavePageTitle : loadSavePageTitle;
