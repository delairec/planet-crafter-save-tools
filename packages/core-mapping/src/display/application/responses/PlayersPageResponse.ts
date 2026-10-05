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

export interface EquipmentSlotResponse {
  readonly kind?: string;
  readonly icon?: string;
  readonly worldObjectName?: string;
}

export interface PlayerEquipmentResponse {
  readonly slots: readonly EquipmentSlotResponse[];
  readonly wornCount: number;
  readonly slotCount: number;
}

export interface InventoryItemGroupResponse {
  readonly worldObjectName: string;
  readonly count: number;
}

export interface PlayerInventoryResponse {
  readonly items: readonly InventoryItemGroupResponse[];
  readonly itemCount: number;
  readonly slotCount: number;
  readonly kindCount: number;
  readonly freeSlotCount: number;
}

export interface PlayerCardResponse {
  readonly name: string;
  readonly planet: string | undefined;
  readonly isHost: boolean;
  readonly gauges: PlayerGaugesResponse;
  readonly equipment: PlayerEquipmentResponse;
  readonly inventory: PlayerInventoryResponse;
}

export interface PlayersPageResponse {
  readonly players: readonly PlayerCardResponse[];
  readonly worldObjectLabels: WorldObjectLabelsResponse;
}
