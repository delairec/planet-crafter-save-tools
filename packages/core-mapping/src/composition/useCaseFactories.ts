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
import {SaveFileValidationPresenterPort} from "../application/ports/SaveFileValidationPresenterPort";
import {MergeResultPresenterPort} from "../application/ports/MergeResultPresenterPort";
import {ConfigurationPagePresenterPort} from "../application/ports/ConfigurationPagePresenterPort";
import {EnergyLevelsPresenterPort} from "../application/ports/EnergyLevelsPresenterPort";
import {PlayersMenuPresenterPort} from "../application/ports/PlayersMenuPresenterPort";
import {PlayersPresenterPort} from "../application/ports/PlayersPresenterPort";
import {SaveIdentityPresenterPort} from "../application/ports/SaveIdentityPresenterPort";
import {TerraformationLevelsPresenterPort} from "../application/ports/TerraformationLevelsPresenterPort";
import {ValidateSaveFile} from "../application/ValidateSaveFile";
import {MergeSaveFiles} from "../application/MergeSaveFiles";
import {LoadConfigurationPage} from "../application/LoadConfigurationPage";
import {LoadEnergyLevelsSection} from "../application/LoadEnergyLevelsSection";
import {LoadPlayersMenu} from "../application/LoadPlayersMenu";
import {LoadPlayersSection} from "../application/LoadPlayersSection";
import {LoadSaveIdentity} from "../application/LoadSaveIdentity";
import {LoadTerraformationLevelsSection} from "../application/LoadTerraformationLevelsSection";

function createSaveSectionsReader(): SaveSectionsReaderPort {
  return new SaveSectionsReaderService(new SaveSectionsParserService());
}

export function createValidateSaveFile(presenter: SaveFileValidationPresenterPort): ValidateSaveFile {
  return new ValidateSaveFile(new SaveValidatorService(), createSaveSectionsReader(), new GameReleasesReaderService(), presenter);
}

export function createMergeSaveFiles(presenter: MergeResultPresenterPort): MergeSaveFiles {
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

export function createLoadConfigurationPage(presenter: ConfigurationPagePresenterPort): LoadConfigurationPage {
  return new LoadConfigurationPage(createSaveSectionsReader(), presenter);
}

export function createLoadEnergyLevelsSection(presenter: EnergyLevelsPresenterPort): LoadEnergyLevelsSection {
  return new LoadEnergyLevelsSection({
    saveSectionsReader: createSaveSectionsReader(),
    energyLevelsReader: new EnergyLevelsReaderService(),
    gameReleasesReader: new GameReleasesReaderService(),
    optimizerRangesReader: new OptimizerRangesReaderService(),
    planetNamesReader: new PlanetNamesReaderService(),
    worldObjectLabelsReader: new WorldObjectLabelsReaderService()
  }, presenter);
}

export function createLoadPlayersMenu(presenter: PlayersMenuPresenterPort): LoadPlayersMenu {
  return new LoadPlayersMenu(createSaveSectionsReader(), presenter);
}

export function createLoadPlayersSection(presenter: PlayersPresenterPort): LoadPlayersSection {
  return new LoadPlayersSection(createSaveSectionsReader(), new WorldObjectLabelsReaderService(), presenter);
}

export function createLoadSaveIdentity(presenter: SaveIdentityPresenterPort): LoadSaveIdentity {
  return new LoadSaveIdentity(createSaveSectionsReader(), new GameReleasesReaderService(), presenter);
}

export function createLoadTerraformationLevelsSection(presenter: TerraformationLevelsPresenterPort): LoadTerraformationLevelsSection {
  return new LoadTerraformationLevelsSection(createSaveSectionsReader(), presenter);
}
