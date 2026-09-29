import {PlayerEntity} from "../../domain/entities/PlayerEntity";
import {GlobalProgressionValueObject} from "../../domain/valueObjects/GlobalProgressionValueObject";
import {TerraformationLevelEntity} from "../../domain/entities/TerraformationLevelEntity";
import {StatisticsValueObject} from "../../domain/valueObjects/StatisticsValueObject";
import {SaveConfigurationValueObject} from "../../domain/valueObjects/SaveConfigurationValueObject";
import {PlanetWorldObjectsValueObject} from "../../domain/valueObjects/PlanetWorldObjectsValueObject";
import {WorldObjectEntity} from "../../domain/entities/WorldObjectEntity";
import {InventoryEntity} from "../../domain/entities/InventoryEntity";

export interface SaveSectionsMapperPort {
  getPlayers(): PlayerEntity[];

  getGlobalProgression(): GlobalProgressionValueObject;

  getDeclaredVersion(): string | undefined;

  getTerraformationLevels(): TerraformationLevelEntity[];

  getStatistics(): StatisticsValueObject | undefined;

  getSaveConfiguration(): SaveConfigurationValueObject | undefined;

  getPlacedWorldObjectsByPlanet(): PlanetWorldObjectsValueObject[];

  getWorldObjects(): WorldObjectEntity[];

  getInventories(): InventoryEntity[];
}
