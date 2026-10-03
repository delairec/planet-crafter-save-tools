import {Accessor, createContext, createResource, createSignal, JSX, Resource} from "solid-js";
import {SaveValidationMessageViewModel} from "core-mapping/save/presentation/viewModels/SaveValidationMessageViewModel";
import {
  loadConfigurationPageController,
  loadPowerPageController,
  loadPlayersMenuController,
  loadSaveIdentityController,
  loadTerraformationLevelsSectionController,
  loadPlayersPageController
} from "core-mapping/display/composition/compositionRoot";
import {loadOverviewPageController} from "core-mapping/display/composition/compositionRoot";
import {OverviewPageViewModel} from "core-mapping/display/presentation/viewModels/OverviewPageViewModel";
import {ConfigurationPageViewModel} from "core-mapping/display/presentation/viewModels/ConfigurationPageViewModel";
import {PowerPageViewModel} from "core-mapping/display/presentation/viewModels/PowerPageViewModel";
import {TerraformationLevelsViewModel} from "core-mapping/display/presentation/viewModels/TerraformationLevelsViewModel";
import {PlayersPageViewModel} from "core-mapping/display/presentation/viewModels/PlayersPageViewModel";
import {SaveIdentityViewModel} from "core-mapping/display/presentation/viewModels/SaveIdentityViewModel";
import {PlayersMenuViewModel} from "core-mapping/display/presentation/viewModels/PlayersMenuViewModel";

export interface LoadedSaveViewModels {
  configurationPage: Resource<ConfigurationPageViewModel>;
  powerPage: Resource<PowerPageViewModel>;
  terraformationLevels: Resource<TerraformationLevelsViewModel>;
  playersPage: Resource<PlayersPageViewModel>;
  saveIdentity: Resource<SaveIdentityViewModel>;
  playersMenu: Resource<PlayersMenuViewModel>;
  overviewPage: Resource<OverviewPageViewModel>;
}
export interface ValidatedSave {
  content: string;
  fileName: string;
  fileSize: number;
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
  const [powerPage] = createResource(validatedContent,
    (content) => loadPowerPageController.loadPowerPage(content));
  const [terraformationLevels] = createResource(validatedContent,
    (content) => loadTerraformationLevelsSectionController.loadTerraformationLevelsSection(content));
  const [playersPage] = createResource(validatedContent,
    (content) => loadPlayersPageController.loadPlayersPage(content));
  const [saveIdentity] = createResource(validatedSave,
    ({content, fileName}) => loadSaveIdentityController.loadSaveIdentity(content, fileName));
  const [playersMenu] = createResource(validatedContent,
    (content) => loadPlayersMenuController.loadPlayersMenu(content));
  const [overviewPage] = createResource(validatedSave,
    ({content, fileName, fileSize}) => loadOverviewPageController.loadOverviewPage({content, fileName, fileSize}));

  const loadedSave: LoadedSave = {
    validatedSave,
    warnings: () => validatedSave()?.warnings ?? [],
    isSaveLoaded: () => validatedContent() !== null,
    loadSave: setValidatedSave,
    unloadSave: () => setValidatedSave(null),
    viewModels: {
      configurationPage, powerPage, terraformationLevels, playersPage, saveIdentity, playersMenu, overviewPage
    }
  };

  return <LoadedSaveContext.Provider value={loadedSave}>{props.children}</LoadedSaveContext.Provider>;
}
