import type {UnreadableLinesResponse} from "../responses/UnreadableLinesResponse";
import type {PlanetPageResponse} from "../responses/PlanetPageResponse";

export interface PlanetPagePresenterPort {
  displayPlanetPage(planetPage: PlanetPageResponse): void;

  displayUnknownPlanet(): void;

  displaySaveWithUnreadableLines(response: UnreadableLinesResponse): void;
}
