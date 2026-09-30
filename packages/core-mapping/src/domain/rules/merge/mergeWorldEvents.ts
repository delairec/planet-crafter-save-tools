import {WorldEventEntry} from '../../save/WorldEventEntry';

export function mergeWorldEvents(worldEventsA: readonly WorldEventEntry[], worldEventsB: readonly WorldEventEntry[]): WorldEventEntry[] {
  const worldEventsFromBNotInA = worldEventsB.filter(eventB =>
    !worldEventsA.some(eventA =>
      eventA.planet === eventB.planet &&
      eventA.seed === eventB.seed &&
      eventA.position === eventB.position
    )
  );

  return [...worldEventsA, ...worldEventsFromBNotInA];
}
