import {Accessor, createResource, Resource} from 'solid-js';
import {LoadSaveConfigurationSectionController} from "core-mapping/controllers/LoadSaveConfigurationSectionController";
import {LoadGlobalProgressionSectionController} from "core-mapping/controllers/LoadGlobalProgressionSectionController";
import {LoadEnergyLevelsSectionController} from "core-mapping/controllers/LoadEnergyLevelsSectionController";
import {LoadTerraformationLevelsSectionController} from "core-mapping/controllers/LoadTerraformationLevelsSectionController";
import {LoadPlayersSectionController} from "core-mapping/controllers/LoadPlayersSectionController";
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

/**
 * Loads the view model for each save section whenever the validated save text changes, so the
 * section components only ever receive a ready-made view model, never the save itself.
 *
 * Each section is a resource: it carries its own loading and error state, and a controller rejection
 * is reported through that resource instead of becoming an unhandled rejection.
 */
export function useSectionViewModels(validatedContent: Accessor<string | null>): SectionViewModels {
  const [saveConfiguration] = createResource(validatedContent,
    (content) => LoadSaveConfigurationSectionController.loadSaveConfigurationSection(content));
  const [globalProgression] = createResource(validatedContent,
    (content) => LoadGlobalProgressionSectionController.loadGlobalProgressionSection(content));
  const [energyLevels] = createResource(validatedContent,
    (content) => LoadEnergyLevelsSectionController.loadEnergyLevelsSection(content));
  const [terraformationLevels] = createResource(validatedContent,
    (content) => LoadTerraformationLevelsSectionController.loadTerraformationLevelsSection(content));
  const [players] = createResource(validatedContent,
    (content) => LoadPlayersSectionController.loadPlayersSection(content));

  return {saveConfiguration, globalProgression, energyLevels, terraformationLevels, players};
}
