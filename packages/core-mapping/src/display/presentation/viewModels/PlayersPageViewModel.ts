import {SaveValidationMessageViewModel} from "../../../save/presentation/viewModels/SaveValidationMessageViewModel";

export type PlayerGaugeKindViewModel = 'oxygen' | 'health' | 'thirst';

export interface PlayerGaugeViewModel {
  kind: PlayerGaugeKindViewModel;
  label: string;
  percentageLabel: string;
  fillPercentage: number;
  amount: string;
}

export interface EquipmentSlotViewModel {
  kindLabel: string;
  itemLabel: string;
  isEmpty: boolean;
}

export interface PlayerEquipmentViewModel {
  caption: string;
  slots: EquipmentSlotViewModel[];
}

export interface InventoryChipViewModel {
  label: string;
  countLabel: string;
}

export interface PlayerInventoryViewModel {
  caption: string;
  items: InventoryChipViewModel[];
  emptySlots: InventoryChipViewModel;
}

export interface PlayerCardViewModel {
  name: string;
  planetLabel?: string;
  hostBadge?: string;
  gauges: PlayerGaugeViewModel[];
  equipment: PlayerEquipmentViewModel;
  inventory: PlayerInventoryViewModel;
}

export interface PlayersPageViewModel {
  unreadableLines?: SaveValidationMessageViewModel[];
  playerCountHint?: string;
  players: PlayerCardViewModel[];
}
