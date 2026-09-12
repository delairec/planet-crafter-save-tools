import {EntriesByOrigin} from './EntriesByOrigin';
import {WorldObjectEntry} from './WorldObjectEntry';

/**
 * @see GR-WO-1, GR-WO-2, GR-WO-3, GR-WO-4 in docs/game-rules.md
 */
export function mergeWorldObjects(worldObjectsA: readonly WorldObjectEntry[], worldObjectsB: readonly WorldObjectEntry[], orphanWorldObjectIds: Set<number>): EntriesByOrigin<WorldObjectEntry> {
  const fromSaveA: WorldObjectEntry[] = [];
  const positionKeysFromA = new Set<string>();
  for (const worldObject of worldObjectsA) {
    if (worldObject.pos) {
      positionKeysFromA.add(buildWorldObjectPositionKey(worldObject));
    }
    fromSaveA.push(worldObject);
  }

  const fromSaveB: WorldObjectEntry[] = [];
  for (const worldObject of worldObjectsB) {
    if (orphanWorldObjectIds.has(worldObject.id)) {
      continue;
    }

    if (!worldObject.pos || !positionKeysFromA.has(buildWorldObjectPositionKey(worldObject))) {
      fromSaveB.push(worldObject);
    }
  }

  return {fromSaveA, fromSaveB};
}

function buildWorldObjectPositionKey(worldObject: WorldObjectEntry): string {
  return `${worldObject.planet ?? ''}:${worldObject.pos}`;
}
