import {PlayerEntry} from "../save/PlayerEntry";

export interface UniqueHostViolation {
  readonly hostCount: number;
}

export function validateUniqueHost(players: readonly PlayerEntry[]): UniqueHostViolation | null {
  if (players.length === 0) {
    return null;
  }

  const hostCount = players.filter(player => player.host).length;
  if (hostCount === 1) {
    return null;
  }

  return {hostCount};
}
