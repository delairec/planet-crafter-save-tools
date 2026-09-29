import {PlayerSummaryResponse} from "./PlayerSummaryResponse";
import {WorldObjectLabels} from "../ports/WorldObjectLabelsReaderPort";

export interface PlayersResponse {
  readonly players: readonly PlayerSummaryResponse[];
  readonly worldObjectLabels: WorldObjectLabels;
}
