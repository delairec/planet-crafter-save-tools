import {WorldObject} from 'shared-save-processing/gameDefinitions';

/**
 * A world object as the merge rules receive it: the two comma-separated identifier lists the save
 * file carries are decoded by infrastructure before the domain sees it, and re-encoded on the way
 * out. A field absent from the save stays absent.
 */
export interface DecodedWorldObject extends Omit<WorldObject, 'siIds' | 'woIds'> {
  readonly siIds?: readonly number[];
  readonly woIds?: readonly number[];
}
