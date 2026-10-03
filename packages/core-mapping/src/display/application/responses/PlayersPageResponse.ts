import {WorldObjectLabelsResponse} from "./WorldObjectLabelsResponse";

export interface PlayerGaugeResponse {
  readonly value: number;
  readonly maximum: number;
  readonly percentage: number;
}

export interface PlayerGaugesResponse {
  readonly oxygen: PlayerGaugeResponse;
  readonly health: PlayerGaugeResponse;
  readonly thirst: PlayerGaugeResponse;
}

export interface PlayerCardResponse {
  readonly name: string;
  readonly planet: string | undefined;
  readonly isHost: boolean;
  readonly gauges: PlayerGaugesResponse;
  readonly equipment: readonly string[];
  readonly inventory: readonly string[];
}

export interface PlayersPageResponse {
  readonly players: readonly PlayerCardResponse[];
  readonly worldObjectLabels: WorldObjectLabelsResponse;
}
