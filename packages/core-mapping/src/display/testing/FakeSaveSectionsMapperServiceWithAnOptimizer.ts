import {FakeSaveSectionsMapperService} from "./FakeSaveSectionsMapperService";
import {PlacedWorldObjectEntity} from "../domain/entities/PlacedWorldObjectEntity";
import {WorldObjectEntity} from "../domain/entities/WorldObjectEntity";
import {InventoryEntity} from "../domain/entities/InventoryEntity";
import {
  createPlanetWorldObjectsValueObject,
  PlanetWorldObjectsValueObject
} from "../domain/valueObjects/PlanetWorldObjectsValueObject";

const OPTIMIZER = new PlacedWorldObjectEntity({id: '3', name: 'Optimizer1' as const, position: [0, 0, 0], planetId: 1, inventoryId: 99});
const BOOSTED_GENERATOR = new PlacedWorldObjectEntity({id: '4', name: 'EnergyGenerator1' as const, position: [1, 0, 0], planetId: 1});
const ENERGY_FUSE = new WorldObjectEntity({id: 'fuse-1', name: 'FuseEnergy1' as const});

export class FakeSaveSectionsMapperServiceWithAnOptimizer extends FakeSaveSectionsMapperService {
  override getPlacedWorldObjectsByPlanet(): PlanetWorldObjectsValueObject[] {
    return [createPlanetWorldObjectsValueObject({planetId: 1, placedWorldObjects: [OPTIMIZER, BOOSTED_GENERATOR]})];
  }

  override getWorldObjects(): WorldObjectEntity[] {
    return [OPTIMIZER, BOOSTED_GENERATOR, ENERGY_FUSE];
  }

  override getInventories(): InventoryEntity[] {
    return [new InventoryEntity({id: 99, worldObjectIds: ['fuse-1'], size: 1})];
  }
}
