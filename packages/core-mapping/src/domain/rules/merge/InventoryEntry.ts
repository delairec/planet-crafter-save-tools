import {Inventory} from 'shared-save-processing/gameDefinitions';

/**
 * An inventory as the merge rules receive it: the comma-separated list of world object identifiers
 * the save file carries is decoded by infrastructure before the domain sees it, and re-encoded on
 * the way out.
 */
export interface DecodedInventory extends Omit<Inventory, 'woIds'> {
  readonly woIds: readonly number[];
}
