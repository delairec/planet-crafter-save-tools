import {Accessor, createContext, createResource, createSignal, JSX, Resource} from "solid-js";
import {SaveValidationMessageViewModel} from "core-mapping/presentation/viewModels/SaveFileValidationViewModel";
import {LoadConfigurationPageController} from "core-mapping/controllers/LoadConfigurationPageController";
import {LoadPlayersSectionController} from "core-mapping/controllers/LoadPlayersSectionController";
import {
  LoadTerraformationLevelsSectionController
} from "core-mapping/controllers/LoadTerraformationLevelsSectionController";
import {LoadEnergyLevelsSectionController} from "core-mapping/controllers/LoadEnergyLevelsSectionController";
import {ConfigurationPageViewModel} from "core-mapping/presentation/viewModels/ConfigurationPageViewModel";
import {EnergyLevelsViewModel} from "core-mapping/presentation/viewModels/EnergyLevelsViewModel";
import {TerraformationLevelsViewModel} from "core-mapping/presentation/viewModels/TerraformationLevelsViewModel";
import {PlayersViewModel} from "core-mapping/presentation/viewModels/PlayersViewModel";
import {LoadSaveIdentityController} from "core-mapping/controllers/LoadSaveIdentityController";
import {LoadPlayersMenuController} from "core-mapping/controllers/LoadPlayersMenuController";
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
    (content) => LoadConfigurationPageController.loadConfigurationPage(content));
  const [energyLevels] = createResource(validatedContent,
    (content) => LoadEnergyLevelsSectionController.loadEnergyLevelsSection(content));
  const [terraformationLevels] = createResource(validatedContent,
    (content) => LoadTerraformationLevelsSectionController.loadTerraformationLevelsSection(content));
  const [players] = createResource(validatedContent,
    (content) => LoadPlayersSectionController.loadPlayersSection(content));
  const [saveIdentity] = createResource(validatedSave,
    ({content, fileName}) => LoadSaveIdentityController.loadSaveIdentity(content, fileName));
  const [playersMenu] = createResource(validatedContent,
    (content) => LoadPlayersMenuController.loadPlayersMenu(content));

  const loadedSave: LoadedSave = {
    validatedSave,
    warnings: () => validatedSave()?.warnings ?? [],
    isSaveLoaded: () => validatedContent() !== null,
    loadSave: setValidatedSave,
    viewModels: {
      configurationPage, energyLevels, terraformationLevels, players, saveIdentity, playersMenu
    }
  };

  return <LoadedSaveContext.Provider value={loadedSave}>{props.children}</LoadedSaveContext.Provider>;
}
