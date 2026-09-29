export interface InventoryEntry {
  readonly id: number;
  readonly worldObjectIds: readonly number[];
  readonly size: number;
  readonly demandGroups?: readonly string[];
  readonly supplyGroups?: readonly string[];
  readonly priority?: number;
}
