import {SaveValidatorService} from "../infrastructure/SaveValidatorService";
import {SaveSectionsParserService} from "../infrastructure/SaveSectionsParserService";
import {SaveSectionsSerializerService} from "../infrastructure/SaveSectionsSerializerService";
import {SaveSectionsReaderService} from "../infrastructure/SaveSectionsReaderService";
import {SaveValidatorPort} from "../application/ports/SaveValidatorPort";
import {SaveSectionsParserPort} from "../application/ports/SaveSectionsParserPort";
import {SaveSectionsSerializerPort} from "../application/ports/SaveSectionsSerializerPort";
import {SaveSectionsReaderPort} from "../application/ports/SaveSectionsReaderPort";
import {EnergyLevelsReaderService} from "../infrastructure/EnergyLevelsReaderService";
import {PlanetNamesReaderService} from "../infrastructure/PlanetNamesReaderService";
import {WorldObjectLabelsReaderService} from "../infrastructure/WorldObjectLabelsReaderService";
import {EnergyLevelsReaderPort} from "../application/ports/EnergyLevelsReaderPort";
import {PlanetNamesReaderPort} from "../application/ports/PlanetNamesReaderPort";
import {WorldObjectLabelsReaderPort} from "../application/ports/WorldObjectLabelsReaderPort";

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

export function createPlanetNamesReader(): PlanetNamesReaderPort {
  return new PlanetNamesReaderService();
}

export function createWorldObjectLabelsReader(): WorldObjectLabelsReaderPort {
  return new WorldObjectLabelsReaderService();
}
