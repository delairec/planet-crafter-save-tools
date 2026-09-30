import {EntriesByOrigin} from './EntriesByOrigin';
import {PlayerEntry} from '../../save/PlayerEntry';

const NUMBER_FIELD_FALLBACKS = {
  cameraView: 0,
  totalCraftedObjects: 0,
  totalTerraTokenEarned: 0
};

const NO_HOST_POSITION = -1;

const applyHostAndFallbacks = (player: PlayerEntry, host: boolean): PlayerEntry =>
  ({...NUMBER_FIELD_FALLBACKS, ...player, host});

export function mergePlayers(playersA: readonly PlayerEntry[], playersB: readonly PlayerEntry[]): EntriesByOrigin<PlayerEntry> {
  const playersFromBNotInA = playersB.filter(playerB =>
    !playersA.some(playerA => playerA.name === playerB.name)
  );

  const hostPositionInSaveA = playersA.findIndex(player => player.host);
  const hostPositionInSaveB = hostPositionInSaveA === NO_HOST_POSITION
    ? playersFromBNotInA.findIndex(player => player.host)
    : NO_HOST_POSITION;

  return {
    fromSaveA: playersA.map((player, position) => applyHostAndFallbacks(player, position === hostPositionInSaveA)),
    fromSaveB: playersFromBNotInA.map((player, position) => applyHostAndFallbacks(player, position === hostPositionInSaveB))
  };
}
