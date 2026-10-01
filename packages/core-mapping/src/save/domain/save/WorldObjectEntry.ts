export interface WorldObjectEntry {
  readonly id: number;
  readonly groupId: string;
  readonly position?: string;
  readonly rotation?: string;
  readonly planet?: number;
  readonly count?: string;
  readonly growth?: number;
  readonly panels?: string;
  readonly color?: string;
  readonly terraformationStageIndex?: number;
  readonly linkedInventoryId?: number;
  readonly linkedInventoryPlanet?: number;
  readonly text?: string;
  readonly logisticGroups?: readonly string[];
  readonly linkedWorldObjectId?: number;
  readonly subInventoryIds?: readonly number[];
  readonly heldWorldObjectIds?: readonly number[];
  readonly terraformationContribution?: number;
  readonly hunger?: number;
  readonly equipmentSet?: number;
}
