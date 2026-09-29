import {PlanetEnergyLevelsValueObject} from "../../domain/valueObjects/PlanetEnergyLevelsValueObject";
import {WorldObjectLabels} from "../ports/WorldObjectLabelsReaderPort";

export interface EnergyLevelsResponse {
  readonly gameRelease: string;
  readonly powerConsumptionModifier: number;
  readonly planets: readonly PlanetEnergyLevelsValueObject[];
  readonly worldObjectLabels: WorldObjectLabels;
}
