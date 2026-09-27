import {Accessor, createContext, createResource, JSX, Resource} from "solid-js";
import {LoadSaveFile, useLoadSaveFile} from "../hooks/useLoadSaveFile.ts";
import {LoadSaveConfigurationSectionController} from "core-mapping/controllers/LoadSaveConfigurationSectionController";
import {LoadPlayersSectionController} from "core-mapping/controllers/LoadPlayersSectionController";
import {
  LoadTerraformationLevelsSectionController
} from "core-mapping/controllers/LoadTerraformationLevelsSectionController";
import {LoadGlobalProgressionSectionController} from "core-mapping/controllers/LoadGlobalProgressionSectionController";
import {LoadEnergyLevelsSectionController} from "core-mapping/controllers/LoadEnergyLevelsSectionController";
import {SaveConfigurationViewModel} from "core-mapping/presentation/viewModels/SaveConfigurationViewModel";
import {GlobalProgressionViewModel} from "core-mapping/presentation/viewModels/GlobalProgressionViewModel";
import {EnergyLevelsViewModel} from "core-mapping/presentation/viewModels/EnergyLevelsViewModel";
import {TerraformationLevelsViewModel} from "core-mapping/presentation/viewModels/TerraformationLevelsViewModel";
import {PlayersViewModel} from "core-mapping/presentation/viewModels/PlayersViewModel";

export interface SectionViewModels {
  saveConfiguration: Resource<SaveConfigurationViewModel>;
  globalProgression: Resource<GlobalProgressionViewModel>;
  energyLevels: Resource<EnergyLevelsViewModel>;
  terraformationLevels: Resource<TerraformationLevelsViewModel>;
  players: Resource<PlayersViewModel>;
}
export interface LoadedSave extends LoadSaveFile {
  isSaveLoaded: Accessor<boolean>;
  viewModels: SectionViewModels;
}

export const LoadedSaveContext = createContext<LoadedSave>();

interface LoadedSaveProviderProps {
  children: JSX.Element;
}

export function LoadedSaveProvider(props: LoadedSaveProviderProps) {
  const loadSaveFile = useLoadSaveFile();

  const [saveConfiguration] = createResource(loadSaveFile.validatedContent,
    (content) => LoadSaveConfigurationSectionController.loadSaveConfigurationSection(content));
  const [globalProgression] = createResource(loadSaveFile.validatedContent,
    (content) => LoadGlobalProgressionSectionController.loadGlobalProgressionSection(content));
  const [energyLevels] = createResource(loadSaveFile.validatedContent,
    (content) => LoadEnergyLevelsSectionController.loadEnergyLevelsSection(content));
  const [terraformationLevels] = createResource(loadSaveFile.validatedContent,
    (content) => LoadTerraformationLevelsSectionController.loadTerraformationLevelsSection(content));
  const [players] = createResource(loadSaveFile.validatedContent,
    (content) => LoadPlayersSectionController.loadPlayersSection(content));

  const loadedSave: LoadedSave = {
    ...loadSaveFile,
    isSaveLoaded: () => loadSaveFile.validatedContent() !== null,
    viewModels: {saveConfiguration, globalProgression, energyLevels, terraformationLevels, players}
  };

  return <LoadedSaveContext.Provider value={loadedSave}>{props.children}</LoadedSaveContext.Provider>;
}
