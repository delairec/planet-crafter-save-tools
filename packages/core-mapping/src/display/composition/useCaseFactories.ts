import {SaveSectionsParserService} from "../../save/infrastructure/SaveSectionsParserService";
import {SaveSectionsReaderService} from "../infrastructure/SaveSectionsReaderService";
import {EnergyLevelsReaderService} from "../infrastructure/EnergyLevelsReaderService";
import {OptimizerRangesReaderService} from "../infrastructure/OptimizerRangesReaderService";
import {PlanetNamesReaderService} from "../infrastructure/PlanetNamesReaderService";
import {WorldObjectLabelsReaderService} from "../infrastructure/WorldObjectLabelsReaderService";
import {GameReleasesReaderService} from "../../save/infrastructure/GameReleasesReaderService";
import {SaveSectionsReaderPort} from "../application/ports/SaveSectionsReaderPort";
import {LoadConfigurationPage} from "../application/LoadConfigurationPage";
import {LoadPowerPage} from "../application/LoadPowerPage";
import {LoadPlayersMenu} from "../application/LoadPlayersMenu";
import {LoadSaveIdentity} from "../application/LoadSaveIdentity";
import {LoadTerraformationLevelsSection} from "../application/LoadTerraformationLevelsSection";
import {ConfigurationPagePresenter} from "../presentation/ConfigurationPagePresenter";
import {ConfigurationPageViewModel} from "../presentation/viewModels/ConfigurationPageViewModel";
import {PowerPagePresenter} from "../presentation/PowerPagePresenter";
import {PowerPageViewModel} from "../presentation/viewModels/PowerPageViewModel";
import {PlayersMenuPresenter} from "../presentation/PlayersMenuPresenter";
import {PlayersMenuViewModel} from "../presentation/viewModels/PlayersMenuViewModel";
import {SaveIdentityPresenter} from "../presentation/SaveIdentityPresenter";
import {SaveIdentityViewModel} from "../presentation/viewModels/SaveIdentityViewModel";
import {TerraformationLevelsPresenter} from "../presentation/TerraformationLevelsPresenter";
import {TerraformationLevelsViewModel} from "../presentation/viewModels/TerraformationLevelsViewModel";
import {LoadSaveIdentityRequest} from "../application/requests/LoadSaveIdentityRequest";
import {LoadSaveSectionsRequest} from "../application/requests/LoadSaveSectionsRequest";
import {UseCaseWithPresenter} from "../../save/controllers/UseCaseFactory";
import {LoadOverviewPage} from "../application/LoadOverviewPage";
import {LoadOverviewPageRequest} from "../application/requests/LoadOverviewPageRequest";
import {OverviewPagePresenter} from "../presentation/OverviewPagePresenter";
import {OverviewPageViewModel} from "../presentation/viewModels/OverviewPageViewModel";
import {LoadPlayersPage} from "../application/LoadPlayersPage";
import {EquipmentKindsReaderService} from "../infrastructure/EquipmentKindsReaderService";
import {OxygenTankCapacitiesReaderService} from "../infrastructure/OxygenTankCapacitiesReaderService";
import {PlayersPagePresenter} from "../presentation/PlayersPagePresenter";
import {PlayersPageViewModel} from "../presentation/viewModels/PlayersPageViewModel";

function createSaveSectionsReader(): SaveSectionsReaderPort {
  return new SaveSectionsReaderService(new SaveSectionsParserService());
}

export function createLoadConfigurationPage(): UseCaseWithPresenter<LoadSaveSectionsRequest, ConfigurationPageViewModel> {
  const presenter = new ConfigurationPagePresenter();
  return {useCase: createLoadConfigurationPageUseCase(presenter), presenter};
}

function createLoadConfigurationPageUseCase(presenter: ConfigurationPagePresenter): LoadConfigurationPage {
  return new LoadConfigurationPage(createSaveSectionsReader(), presenter);
}

export function createLoadPowerPage(): UseCaseWithPresenter<LoadSaveSectionsRequest, PowerPageViewModel> {
  const presenter = new PowerPagePresenter();
  return {useCase: createLoadPowerPageUseCase(presenter), presenter};
}

function createLoadPowerPageUseCase(presenter: PowerPagePresenter): LoadPowerPage {
  return new LoadPowerPage({
    saveSectionsReader: createSaveSectionsReader(),
    energyLevelsReader: new EnergyLevelsReaderService(),
    gameReleasesReader: new GameReleasesReaderService(),
    optimizerRangesReader: new OptimizerRangesReaderService(),
    planetNamesReader: new PlanetNamesReaderService(),
    worldObjectLabelsReader: new WorldObjectLabelsReaderService()
  }, presenter);
}

export function createLoadPlayersMenu(): UseCaseWithPresenter<LoadSaveSectionsRequest, PlayersMenuViewModel> {
  const presenter = new PlayersMenuPresenter();
  return {useCase: createLoadPlayersMenuUseCase(presenter), presenter};
}

function createLoadPlayersMenuUseCase(presenter: PlayersMenuPresenter): LoadPlayersMenu {
  return new LoadPlayersMenu(createSaveSectionsReader(), presenter);
}

export function createLoadSaveIdentity(): UseCaseWithPresenter<LoadSaveIdentityRequest, SaveIdentityViewModel> {
  const presenter = new SaveIdentityPresenter();
  return {useCase: createLoadSaveIdentityUseCase(presenter), presenter};
}

function createLoadSaveIdentityUseCase(presenter: SaveIdentityPresenter): LoadSaveIdentity {
  return new LoadSaveIdentity(createSaveSectionsReader(), new GameReleasesReaderService(), presenter);
}

export function createLoadTerraformationLevelsSection(): UseCaseWithPresenter<LoadSaveSectionsRequest, TerraformationLevelsViewModel> {
  const presenter = new TerraformationLevelsPresenter();
  return {useCase: createLoadTerraformationLevelsSectionUseCase(presenter), presenter};
}

function createLoadTerraformationLevelsSectionUseCase(presenter: TerraformationLevelsPresenter): LoadTerraformationLevelsSection {
  return new LoadTerraformationLevelsSection(createSaveSectionsReader(), presenter);
}

export function createLoadOverviewPage(): UseCaseWithPresenter<LoadOverviewPageRequest, OverviewPageViewModel> {
  const presenter = new OverviewPagePresenter();
  return {useCase: createLoadOverviewPageUseCase(presenter), presenter};
}

function createLoadOverviewPageUseCase(presenter: OverviewPagePresenter): LoadOverviewPage {
  return new LoadOverviewPage({
    saveSectionsReader: createSaveSectionsReader(),
    gameReleasesReader: new GameReleasesReaderService(),
    energyLevelsReader: new EnergyLevelsReaderService(),
    optimizerRangesReader: new OptimizerRangesReaderService(),
    planetNamesReader: new PlanetNamesReaderService()
  }, presenter);
}

export function createLoadPlayersPage(): UseCaseWithPresenter<LoadSaveSectionsRequest, PlayersPageViewModel> {
  const presenter = new PlayersPagePresenter();
  return {useCase: createLoadPlayersPageUseCase(presenter), presenter};
}

function createLoadPlayersPageUseCase(presenter: PlayersPagePresenter): LoadPlayersPage {
  return new LoadPlayersPage({
    saveSectionsReader: createSaveSectionsReader(),
    worldObjectLabelsReader: new WorldObjectLabelsReaderService(),
    oxygenTankCapacitiesReader: new OxygenTankCapacitiesReaderService(),
    equipmentKindsReader: new EquipmentKindsReaderService()
  }, presenter);
}
