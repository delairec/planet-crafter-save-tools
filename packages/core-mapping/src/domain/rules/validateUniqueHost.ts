import type {Player} from "shared-save-processing/gameDefinitions";

export interface UniqueHostViolation {
  readonly hostCount: number;
}

/** A valid multiplayer save must designate exactly one player as the host. */
export function validateUniqueHost(players: Player[] | undefined): UniqueHostViolation | null {
  if (!players || players.length === 0) {
    return null;
  }

  const hostCount = players.filter(player => player.host === true).length;
  if (hostCount === 1) {
    return null;
  }

  return {hostCount};
}
