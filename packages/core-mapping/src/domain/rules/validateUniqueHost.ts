import {PlayerEntity} from "../entities/PlayerEntity";

export interface UniqueHostViolation {
  readonly hostCount: number;
}

export function validateUniqueHost(players: readonly PlayerEntity[]): UniqueHostViolation | null {
  if (players.length === 0) {
    return null;
  }

  const hostCount = players.filter(player => player.isHost).length;
  if (hostCount === 1) {
    return null;
  }

  return {hostCount};
}
