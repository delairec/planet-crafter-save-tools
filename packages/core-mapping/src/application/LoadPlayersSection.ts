import {PlayersPresenterPort} from './ports/PlayersPresenterPort';
import {SaveSectionsReaderPort} from './ports/SaveSectionsReaderPort';
import {PlayerSummaryResponse} from './responses/PlayerSummaryResponse';

export class LoadPlayersSection {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly presenter: PlayersPresenterPort,
  ) {}

  async execute(): Promise<void> {
    const players = this.saveSectionsReader.getPlayers().map((player): PlayerSummaryResponse => ({
      name: player.name,
      inventory: player.inventory,
      equipment: player.equipment
    }));

    this.presenter.displayPlayers(players);
  }
}
