import {SaveValidatorService} from "../infrastructure/SaveValidatorService";
import {SaveSectionsParserService} from "../infrastructure/SaveSectionsParserService";
import {SaveSectionsSerializerService} from "../infrastructure/SaveSectionsSerializerService";
import {SaveSectionsReaderService} from "../infrastructure/SaveSectionsReaderService";
import {SaveValidatorPort} from "../application/ports/SaveValidatorPort";
import {SaveSectionsParserPort} from "../application/ports/SaveSectionsParserPort";
import {SaveSectionsSerializerPort} from "../application/ports/SaveSectionsSerializerPort";
import {SaveSectionsReaderPort} from "../application/ports/SaveSectionsReaderPort";
import {EnergyLevelsReaderService} from "../infrastructure/EnergyLevelsReaderService";
import {OptimizerRangesReaderService} from "../infrastructure/OptimizerRangesReaderService";
import {PlanetNamesReaderService} from "../infrastructure/PlanetNamesReaderService";
import {WorldObjectLabelsReaderService} from "../infrastructure/WorldObjectLabelsReaderService";
import {EnergyLevelsReaderPort} from "../application/ports/EnergyLevelsReaderPort";
import {OptimizerRangesReaderPort} from "../application/ports/OptimizerRangesReaderPort";
import {PlanetNamesReaderPort} from "../application/ports/PlanetNamesReaderPort";
import {WorldObjectLabelsReaderPort} from "../application/ports/WorldObjectLabelsReaderPort";
import {GameReleasesReaderService} from "../infrastructure/GameReleasesReaderService";
import {MergedFileNamerService} from "../infrastructure/MergedFileNamerService";
import {GameReleasesReaderPort} from "../application/ports/GameReleasesReaderPort";
import {MergedFileNamerPort} from "../application/ports/MergedFileNamerPort";

export function createSaveValidator(): SaveValidatorPort {
  return new SaveValidatorService();
}

export function createSaveSectionsParser(): SaveSectionsParserPort {
  return new SaveSectionsParserService();
}

export function createSaveSectionsSerializer(): SaveSectionsSerializerPort {
  return new SaveSectionsSerializerService();
}

export function createSaveSectionsReader(): SaveSectionsReaderPort {
  return new SaveSectionsReaderService(createSaveSectionsParser());
}

export function createEnergyLevelsReader(): EnergyLevelsReaderPort {
  return new EnergyLevelsReaderService();
}

export function createOptimizerRangesReader(): OptimizerRangesReaderPort {
  return new OptimizerRangesReaderService();
}

export function createPlanetNamesReader(): PlanetNamesReaderPort {
  return new PlanetNamesReaderService();
}

export function createWorldObjectLabelsReader(): WorldObjectLabelsReaderPort {
  return new WorldObjectLabelsReaderService();
}

export function createGameReleasesReader(): GameReleasesReaderPort {
  return new GameReleasesReaderService();
}

export function createMergedFileNamer(): MergedFileNamerPort {
  return new MergedFileNamerService();
}
