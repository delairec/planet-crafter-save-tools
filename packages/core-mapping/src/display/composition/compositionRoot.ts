import {LoadConfigurationPageController} from "../controllers/LoadConfigurationPageController";
import {LoadEnergyLevelsSectionController} from "../controllers/LoadEnergyLevelsSectionController";
import {LoadPlayersMenuController} from "../controllers/LoadPlayersMenuController";
import {LoadPlayersSectionController} from "../controllers/LoadPlayersSectionController";
import {LoadSaveIdentityController} from "../controllers/LoadSaveIdentityController";
import {LoadTerraformationLevelsSectionController} from "../controllers/LoadTerraformationLevelsSectionController";
import {createLoadConfigurationPage, createLoadEnergyLevelsSection, createLoadPlayersMenu, createLoadPlayersSection, createLoadSaveIdentity, createLoadTerraformationLevelsSection} from "./useCaseFactories";
import {LoadOverviewPageController} from "../controllers/LoadOverviewPageController";
import {createLoadOverviewPage} from "./useCaseFactories";

export const loadConfigurationPageController = new LoadConfigurationPageController(createLoadConfigurationPage);
export const loadEnergyLevelsSectionController = new LoadEnergyLevelsSectionController(createLoadEnergyLevelsSection);
export const loadPlayersMenuController = new LoadPlayersMenuController(createLoadPlayersMenu);
export const loadPlayersSectionController = new LoadPlayersSectionController(createLoadPlayersSection);
export const loadSaveIdentityController = new LoadSaveIdentityController(createLoadSaveIdentity);
export const loadTerraformationLevelsSectionController = new LoadTerraformationLevelsSectionController(createLoadTerraformationLevelsSection);
export const loadOverviewPageController = new LoadOverviewPageController(createLoadOverviewPage);
