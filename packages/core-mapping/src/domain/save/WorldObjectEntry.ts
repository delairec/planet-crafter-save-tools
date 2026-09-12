import {WorldObject} from 'shared-save-processing/gameDefinitions';

export interface WorldObjectEntry extends Omit<WorldObject, 'siIds' | 'woIds'> {
  readonly siIds?: readonly number[];
  readonly woIds?: readonly number[];
}
