import {LoadAndValidateSaveFileController} from "../controllers/LoadAndValidateSaveFileController";
import {LoadConfigurationPageController} from "../controllers/LoadConfigurationPageController";
import {LoadEnergyLevelsSectionController} from "../controllers/LoadEnergyLevelsSectionController";
import {LoadPlayersMenuController} from "../controllers/LoadPlayersMenuController";
import {LoadPlayersSectionController} from "../controllers/LoadPlayersSectionController";
import {LoadSaveIdentityController} from "../controllers/LoadSaveIdentityController";
import {LoadTerraformationLevelsSectionController} from "../controllers/LoadTerraformationLevelsSectionController";
import {MergeSaveFilesController} from "../controllers/MergeSaveFilesController";
import {ValidateSaveFileController} from "../controllers/ValidateSaveFileController";
import {
  createValidateSaveFile,
  createLoadAndValidateSaveFile,
  createMergeSaveFiles,
  createLoadConfigurationPage,
  createLoadEnergyLevelsSection,
  createLoadPlayersMenu,
  createLoadPlayersSection,
  createLoadSaveIdentity,
  createLoadTerraformationLevelsSection
} from "./useCaseFactories";

export const validateSaveFileController = new ValidateSaveFileController(createValidateSaveFile);
export const loadAndValidateSaveFileController = new LoadAndValidateSaveFileController(createLoadAndValidateSaveFile);
export const mergeSaveFilesController = new MergeSaveFilesController(createMergeSaveFiles);
export const loadConfigurationPageController = new LoadConfigurationPageController(createLoadConfigurationPage);
export const loadEnergyLevelsSectionController = new LoadEnergyLevelsSectionController(createLoadEnergyLevelsSection);
export const loadPlayersMenuController = new LoadPlayersMenuController(createLoadPlayersMenu);
export const loadPlayersSectionController = new LoadPlayersSectionController(createLoadPlayersSection);
export const loadSaveIdentityController = new LoadSaveIdentityController(createLoadSaveIdentity);
export const loadTerraformationLevelsSectionController = new LoadTerraformationLevelsSectionController(createLoadTerraformationLevelsSection);
