import {EntriesByOrigin} from './EntriesByOrigin';
import {IdSequence} from './createIdSequence';
import {ResolvedEntries} from './ResolvedEntries';
import {WorldObjectEntry} from './WorldObjectEntry';

/**
 * Gives a new identifier to every save B world object whose identifier is already used in save A.
 * @see GR-ID-1, GR-ID-2 in docs/game-rules.md
 */
export function resolveWorldObjectIdConflicts(worldObjects: EntriesByOrigin<WorldObjectEntry>, idSequence: IdSequence): ResolvedEntries<WorldObjectEntry> {
  const usedIds = new Set(worldObjects.fromSaveA.map(worldObject => worldObject.id));
  const saveBIdRemapping = new Map<number, number>();

  const fromSaveB = worldObjects.fromSaveB.map(worldObject => {
    if (!usedIds.has(worldObject.id)) {
      usedIds.add(worldObject.id);
      return worldObject;
    }

    const newId = idSequence.next();
    saveBIdRemapping.set(worldObject.id, newId);
    return {...worldObject, id: newId};
  });

  return {entries: {fromSaveA: worldObjects.fromSaveA, fromSaveB}, saveBIdRemapping};
}
