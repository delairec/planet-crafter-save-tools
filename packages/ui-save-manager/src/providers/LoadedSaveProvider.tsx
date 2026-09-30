import {Accessor, createContext, createResource, createSignal, JSX, Resource} from "solid-js";
import {SaveValidationMessageViewModel} from "core-mapping/presentation/viewModels/SaveFileValidationViewModel";
import {loadConfigurationPageController} from "core-mapping/controllers/LoadConfigurationPageController";
import {loadPlayersSectionController} from "core-mapping/controllers/LoadPlayersSectionController";
import {
  loadTerraformationLevelsSectionController
} from "core-mapping/controllers/LoadTerraformationLevelsSectionController";
import {loadEnergyLevelsSectionController} from "core-mapping/controllers/LoadEnergyLevelsSectionController";
import {ConfigurationPageViewModel} from "core-mapping/presentation/viewModels/ConfigurationPageViewModel";
import {EnergyLevelsViewModel} from "core-mapping/presentation/viewModels/EnergyLevelsViewModel";
import {TerraformationLevelsViewModel} from "core-mapping/presentation/viewModels/TerraformationLevelsViewModel";
import {PlayersViewModel} from "core-mapping/presentation/viewModels/PlayersViewModel";
import {loadSaveIdentityController} from "core-mapping/controllers/LoadSaveIdentityController";
import {loadPlayersMenuController} from "core-mapping/controllers/LoadPlayersMenuController";
import {SaveIdentityViewModel} from "core-mapping/presentation/viewModels/SaveIdentityViewModel";
import {PlayersMenuViewModel} from "core-mapping/presentation/viewModels/PlayersMenuViewModel";

export interface LoadedSaveViewModels {
  configurationPage: Resource<ConfigurationPageViewModel>;
  energyLevels: Resource<EnergyLevelsViewModel>;
  terraformationLevels: Resource<TerraformationLevelsViewModel>;
  players: Resource<PlayersViewModel>;
  saveIdentity: Resource<SaveIdentityViewModel>;
  playersMenu: Resource<PlayersMenuViewModel>;
}
export interface ValidatedSave {
  content: string;
  fileName: string;
  warnings: SaveValidationMessageViewModel[];
}

export interface LoadedSave {
  validatedSave: Accessor<ValidatedSave | null>;
  warnings: Accessor<SaveValidationMessageViewModel[]>;
  isSaveLoaded: Accessor<boolean>;
  loadSave: (save: ValidatedSave) => void;
  unloadSave: () => void;
  viewModels: LoadedSaveViewModels;
}

export const LoadedSaveContext = createContext<LoadedSave>();

interface LoadedSaveProviderProps {
  children: JSX.Element;
}

export function LoadedSaveProvider(props: LoadedSaveProviderProps) {
  const [validatedSave, setValidatedSave] = createSignal<ValidatedSave | null>(null);
  const validatedContent = () => validatedSave()?.content ?? null;

  const [configurationPage] = createResource(validatedContent,
    (content) => loadConfigurationPageController.loadConfigurationPage(content));
  const [energyLevels] = createResource(validatedContent,
    (content) => loadEnergyLevelsSectionController.loadEnergyLevelsSection(content));
  const [terraformationLevels] = createResource(validatedContent,
    (content) => loadTerraformationLevelsSectionController.loadTerraformationLevelsSection(content));
  const [players] = createResource(validatedContent,
    (content) => loadPlayersSectionController.loadPlayersSection(content));
  const [saveIdentity] = createResource(validatedSave,
    ({content, fileName}) => loadSaveIdentityController.loadSaveIdentity(content, fileName));
  const [playersMenu] = createResource(validatedContent,
    (content) => loadPlayersMenuController.loadPlayersMenu(content));

  const loadedSave: LoadedSave = {
    validatedSave,
    warnings: () => validatedSave()?.warnings ?? [],
    isSaveLoaded: () => validatedContent() !== null,
    loadSave: setValidatedSave,
    unloadSave: () => setValidatedSave(null),
    viewModels: {
      configurationPage, energyLevels, terraformationLevels, players, saveIdentity, playersMenu
    }
  };

  return <LoadedSaveContext.Provider value={loadedSave}>{props.children}</LoadedSaveContext.Provider>;
}
