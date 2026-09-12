import {EntriesByOrigin} from './EntriesByOrigin';
import {DecodedWorldObject} from './DecodedWorldObject';

/**
 * @see GR-WO-1, GR-WO-2, GR-WO-3, GR-WO-4 in docs/game-rules.md
 */
export function mergeWorldObjects(worldObjectsGeneratorA: Generator<DecodedWorldObject>, worldObjectsGeneratorB: Generator<DecodedWorldObject>, orphanWorldObjectIds: Set<number>): EntriesByOrigin<DecodedWorldObject> {
  const fromSaveA: DecodedWorldObject[] = [];
  const positionKeysFromA = new Set<string>();
  for (const worldObject of worldObjectsGeneratorA) {
    if (worldObject.pos) {
      positionKeysFromA.add(buildWorldObjectPositionKey(worldObject));
    }
    fromSaveA.push(worldObject);
  }

  const fromSaveB: DecodedWorldObject[] = [];
  for (const worldObject of worldObjectsGeneratorB) {
    if (orphanWorldObjectIds.has(worldObject.id)) {
      continue;
    }

    if (!worldObject.pos || !positionKeysFromA.has(buildWorldObjectPositionKey(worldObject))) {
      fromSaveB.push(worldObject);
    }
  }

  return {fromSaveA, fromSaveB};
}

function buildWorldObjectPositionKey(worldObject: DecodedWorldObject): string {
  return `${worldObject.planet ?? ''}:${worldObject.pos}`;
}
