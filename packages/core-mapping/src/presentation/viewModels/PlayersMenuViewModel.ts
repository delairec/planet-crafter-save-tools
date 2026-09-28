export interface PlayersMenuViewModel {
  players: PlayerMenuEntryViewModel[];
}

interface PlayerMenuEntryViewModel {
  name: string;
  planet?: string;
  hostBadge?: string;
}
