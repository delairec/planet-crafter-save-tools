import {Inventory} from 'shared-save-processing/gameDefinitions';

export interface InventoryEntry extends Omit<Inventory, 'woIds'> {
  readonly woIds: readonly number[];
}
