import {PlayerSummaryResponse} from "./PlayerSummaryResponse";
import {WorldObjectLabelsResponse} from "./WorldObjectLabelsResponse";

export interface PlayersResponse {
  readonly players: readonly PlayerSummaryResponse[];
  readonly worldObjectLabels: WorldObjectLabelsResponse;
}
