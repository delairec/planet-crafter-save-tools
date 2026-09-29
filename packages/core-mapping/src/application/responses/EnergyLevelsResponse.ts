import {PlanetEnergyLevelsValueObject} from "../../domain/valueObjects/PlanetEnergyLevelsValueObject";
import {WorldObjectLabelsResponse} from "./WorldObjectLabelsResponse";

export interface EnergyLevelsResponse {
  readonly gameRelease: string;
  readonly gameReleaseIsEarlierThanCurrent: boolean;
  readonly powerConsumptionModifier: number;
  readonly planets: readonly PlanetEnergyLevelsValueObject[];
  readonly worldObjectLabels: WorldObjectLabelsResponse;
}
