import {SaveValidatorService} from "../infrastructure/SaveValidatorService";
import {SaveSectionsParserService} from "../infrastructure/SaveSectionsParserService";
import {SaveSectionsSerializerService} from "../infrastructure/SaveSectionsSerializerService";
import {SaveSectionsReaderService} from "../infrastructure/SaveSectionsReaderService";
import {EnergyLevelsReaderService} from "../infrastructure/EnergyLevelsReaderService";
import {OptimizerRangesReaderService} from "../infrastructure/OptimizerRangesReaderService";
import {PlanetNamesReaderService} from "../infrastructure/PlanetNamesReaderService";
import {WorldObjectLabelsReaderService} from "../infrastructure/WorldObjectLabelsReaderService";
import {GameReleasesReaderService} from "../infrastructure/GameReleasesReaderService";
import {FileNameSanitizerService} from "../infrastructure/FileNameSanitizerService";
import {SaveSectionsReaderPort} from "../application/ports/SaveSectionsReaderPort";
import {ValidateSaveFile} from "../application/ValidateSaveFile";
import {MergeSaveFiles} from "../application/MergeSaveFiles";
import {LoadConfigurationPage} from "../application/LoadConfigurationPage";
import {LoadEnergyLevelsSection} from "../application/LoadEnergyLevelsSection";
import {LoadPlayersMenu} from "../application/LoadPlayersMenu";
import {LoadPlayersSection} from "../application/LoadPlayersSection";
import {LoadSaveIdentity} from "../application/LoadSaveIdentity";
import {LoadTerraformationLevelsSection} from "../application/LoadTerraformationLevelsSection";
import {SaveFileValidationPresenterPort} from "../application/ports/SaveFileValidationPresenterPort";
import {SaveFileValidationPresenter} from "../presentation/SaveFileValidationPresenter";
import {SaveFileValidationViewModel} from "../presentation/viewModels/SaveFileValidationViewModel";
import {MergeResultPresenter} from "../presentation/MergeResultPresenter";
import {MergeResultViewModel} from "../presentation/viewModels/MergeResultViewModel";
import {ConfigurationPagePresenter} from "../presentation/ConfigurationPagePresenter";
import {ConfigurationPageViewModel} from "../presentation/viewModels/ConfigurationPageViewModel";
import {EnergyLevelsPresenter} from "../presentation/EnergyLevelsPresenter";
import {EnergyLevelsViewModel} from "../presentation/viewModels/EnergyLevelsViewModel";
import {PlayersMenuPresenter} from "../presentation/PlayersMenuPresenter";
import {PlayersMenuViewModel} from "../presentation/viewModels/PlayersMenuViewModel";
import {PlayersPresenter} from "../presentation/PlayersPresenter";
import {PlayersViewModel} from "../presentation/viewModels/PlayersViewModel";
import {SaveIdentityPresenter} from "../presentation/SaveIdentityPresenter";
import {SaveIdentityViewModel} from "../presentation/viewModels/SaveIdentityViewModel";
import {TerraformationLevelsPresenter} from "../presentation/TerraformationLevelsPresenter";
import {TerraformationLevelsViewModel} from "../presentation/viewModels/TerraformationLevelsViewModel";
import {LoadSaveFilePresenter} from "../presentation/LoadSaveFilePresenter";
import {LoadSaveFileViewModel} from "../presentation/viewModels/LoadSaveFileViewModel";
import {LoadSaveIdentityRequest} from "../application/requests/LoadSaveIdentityRequest";
import {LoadSaveSectionsRequest} from "../application/requests/LoadSaveSectionsRequest";
import {MergeSaveFilesRequest} from "../application/requests/MergeSaveFilesRequest";
import {ValidateSaveFileRequest} from "../application/requests/ValidateSaveFileRequest";
import {UseCaseWithPresenter} from "../controllers/UseCaseFactory";

function createSaveSectionsReader(): SaveSectionsReaderPort {
  return new SaveSectionsReaderService(new SaveSectionsParserService());
}

export function createValidateSaveFile(): UseCaseWithPresenter<ValidateSaveFileRequest, SaveFileValidationViewModel> {
  const presenter = new SaveFileValidationPresenter();
  return {useCase: createValidateSaveFileUseCase(presenter), presenter};
}

function createValidateSaveFileUseCase(presenter: SaveFileValidationPresenterPort): ValidateSaveFile {
  return new ValidateSaveFile(new SaveValidatorService(), createSaveSectionsReader(), new GameReleasesReaderService(), presenter);
}

export function createLoadAndValidateSaveFile(): UseCaseWithPresenter<ValidateSaveFileRequest, LoadSaveFileViewModel> {
  const presenter = new LoadSaveFilePresenter();
  return {useCase: createValidateSaveFileUseCase(presenter), presenter};
}

export function createMergeSaveFiles(): UseCaseWithPresenter<MergeSaveFilesRequest, MergeResultViewModel> {
  const presenter = new MergeResultPresenter();
  return {useCase: createMergeSaveFilesUseCase(presenter), presenter};
}

function createMergeSaveFilesUseCase(presenter: MergeResultPresenter): MergeSaveFiles {
  return new MergeSaveFiles(
    new SaveValidatorService(),
    createSaveSectionsReader(),
    new SaveSectionsParserService(),
    new SaveSectionsSerializerService(),
    new GameReleasesReaderService(),
    new FileNameSanitizerService(),
    presenter
  );
}

export function createLoadConfigurationPage(): UseCaseWithPresenter<LoadSaveSectionsRequest, ConfigurationPageViewModel> {
  const presenter = new ConfigurationPagePresenter();
  return {useCase: createLoadConfigurationPageUseCase(presenter), presenter};
}

function createLoadConfigurationPageUseCase(presenter: ConfigurationPagePresenter): LoadConfigurationPage {
  return new LoadConfigurationPage(createSaveSectionsReader(), presenter);
}

export function createLoadEnergyLevelsSection(): UseCaseWithPresenter<LoadSaveSectionsRequest, EnergyLevelsViewModel> {
  const presenter = new EnergyLevelsPresenter();
  return {useCase: createLoadEnergyLevelsSectionUseCase(presenter), presenter};
}

function createLoadEnergyLevelsSectionUseCase(presenter: EnergyLevelsPresenter): LoadEnergyLevelsSection {
  return new LoadEnergyLevelsSection({
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

export function createLoadPlayersSection(): UseCaseWithPresenter<LoadSaveSectionsRequest, PlayersViewModel> {
  const presenter = new PlayersPresenter();
  return {useCase: createLoadPlayersSectionUseCase(presenter), presenter};
}

function createLoadPlayersSectionUseCase(presenter: PlayersPresenter): LoadPlayersSection {
  return new LoadPlayersSection(createSaveSectionsReader(), new WorldObjectLabelsReaderService(), presenter);
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
