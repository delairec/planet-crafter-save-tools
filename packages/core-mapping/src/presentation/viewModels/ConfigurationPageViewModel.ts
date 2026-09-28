export type ToneViewModel = 'neutral' | 'danger' | 'positive';

export interface TonedValueViewModel {
  value: string;
  tone: ToneViewModel;
  toneLabel: string;
}

export interface ProgressionFieldViewModel {
  label: string;
  value: string;
}

export interface DroneLogisticsViewModel {
  label: string;
  badge: TonedValueViewModel;
}

export interface ProgressionZoneViewModel {
  fields: ProgressionFieldViewModel[];
  droneLogistics?: DroneLogisticsViewModel;
}

export interface ModifierViewModel {
  label: string;
  badge: TonedValueViewModel;
}

export interface ModifiersZoneViewModel {
  modifiers: ModifierViewModel[];
}

export type UnlockStateViewModel = 'on' | 'off';

export interface UnlockFlagViewModel {
  label: string;
  state: UnlockStateViewModel;
  stateLabel: string;
}

export interface UnlocksZoneViewModel {
  flags: UnlockFlagViewModel[];
}

export interface ConfigurationPageViewModel {
  progression: ProgressionZoneViewModel;
  modifiers?: ModifiersZoneViewModel;
  unlocks?: UnlocksZoneViewModel;
}
