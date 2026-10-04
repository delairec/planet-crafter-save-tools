import {Accessor, createContext, createResource, createSignal, getOwner, JSX, Resource, runWithOwner} from "solid-js";
import {SaveValidationMessageViewModel} from "core-mapping/save/presentation/viewModels/SaveValidationMessageViewModel";
import {
  loadConfigurationPageController,
  loadPowerPageController,
  loadPlayersMenuController,
  loadSaveIdentityController,
  loadTerraformationPageController,
  loadPlayersPageController
} from "core-mapping/display/composition/compositionRoot";
import {loadOverviewPageController} from "core-mapping/display/composition/compositionRoot";
import {loadPlanetPageController} from "core-mapping/display/composition/compositionRoot";
import {OverviewPageViewModel} from "core-mapping/display/presentation/viewModels/OverviewPageViewModel";
import {ConfigurationPageViewModel} from "core-mapping/display/presentation/viewModels/ConfigurationPageViewModel";
import {PowerPageViewModel} from "core-mapping/display/presentation/viewModels/PowerPageViewModel";
import {TerraformationPageViewModel} from "core-mapping/display/presentation/viewModels/TerraformationPageViewModel";
import {PlayersPageViewModel} from "core-mapping/display/presentation/viewModels/PlayersPageViewModel";
import {SaveIdentityViewModel} from "core-mapping/display/presentation/viewModels/SaveIdentityViewModel";
import {PlayersMenuViewModel} from "core-mapping/display/presentation/viewModels/PlayersMenuViewModel";
import {PlanetPageViewModel} from "core-mapping/display/presentation/viewModels/PlanetPageViewModel";

export interface LoadedSaveViewModels {
  configurationPage: Resource<ConfigurationPageViewModel>;
  powerPage: Resource<PowerPageViewModel>;
  terraformationPage: Resource<TerraformationPageViewModel>;
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
  planetPage: (planetIdentifier: string) => Resource<PlanetPageViewModel>;
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
  const [terraformationPage] = createResource(validatedContent,
    (content) => loadTerraformationPageController.loadTerraformationPage(content));
  const [playersPage] = createResource(validatedContent,
    (content) => loadPlayersPageController.loadPlayersPage(content));
  const [saveIdentity] = createResource(validatedSave,
    ({content, fileName}) => loadSaveIdentityController.loadSaveIdentity(content, fileName));
  const [playersMenu] = createResource(validatedContent,
    (content) => loadPlayersMenuController.loadPlayersMenu(content));
  const [overviewPage] = createResource(validatedSave,
    ({content, fileName, fileSize}) => loadOverviewPageController.loadOverviewPage({content, fileName, fileSize}));

  const owner = getOwner();
  const planetPages = new Map<string, Resource<PlanetPageViewModel>>();
  const createPlanetPage = (planetIdentifier: string): Resource<PlanetPageViewModel> => {
    const [planetPage] = createResource(validatedContent,
      (content) => loadPlanetPageController.loadPlanetPage({content, planetIdentifier}));
    return planetPage;
  };
  const planetPage = (planetIdentifier: string): Resource<PlanetPageViewModel> => {
    const knownPlanetPage = planetPages.get(planetIdentifier);
    if (knownPlanetPage) {
      return knownPlanetPage;
    }
    const createdPlanetPage = runWithOwner(owner, () => createPlanetPage(planetIdentifier))!;
    planetPages.set(planetIdentifier, createdPlanetPage);
    return createdPlanetPage;
  };

  const loadedSave: LoadedSave = {
    validatedSave,
    warnings: () => validatedSave()?.warnings ?? [],
    isSaveLoaded: () => validatedContent() !== null,
    loadSave: setValidatedSave,
    unloadSave: () => setValidatedSave(null),
    viewModels: {
      configurationPage, powerPage, terraformationPage, playersPage, saveIdentity, playersMenu, overviewPage
    },
    planetPage
  };

  return <LoadedSaveContext.Provider value={loadedSave}>{props.children}</LoadedSaveContext.Provider>;
}
