import {SaveSections} from '../save/SaveSections';
import {UnreadableLine} from '../save/SaveSectionLocation';
import {validateUniqueHost} from './validateUniqueHost';

export type BrokenSaveInvariant =
  | {readonly code: 'unreadable-lines'; readonly unreadableLines: readonly UnreadableLine[]}
  | {readonly code: 'no-unique-host'; readonly hostCount: number};

export function checkSaveInvariants(sections: SaveSections, unreadableLines: readonly UnreadableLine[]): BrokenSaveInvariant | null {
  if (unreadableLines.length > 0) {
    return {code: 'unreadable-lines', unreadableLines};
  }

  const uniqueHostViolation = validateUniqueHost(sections.players);

  if (uniqueHostViolation !== null) {
    return {code: 'no-unique-host', hostCount: uniqueHostViolation.hostCount};
  }

  return null;
}
