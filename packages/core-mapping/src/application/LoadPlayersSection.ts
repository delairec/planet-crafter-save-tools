import {PlayersPresenterPort} from './ports/PlayersPresenterPort';
import {SaveSectionsReaderPort} from './ports/SaveSectionsReaderPort';
import {createPlayerSummaryValueObject} from '../domain/valueObjects/PlayerSummaryValueObject';

export class LoadPlayersSection {
  constructor(
    private readonly saveParser: SaveSectionsReaderPort,
    private readonly presenter: PlayersPresenterPort,
  ) {}

  async execute(): Promise<void> {
    const players = this.saveParser.getPlayers().map((player) => createPlayerSummaryValueObject({
      name: player.name,
      inventory: player.inventory,
      equipment: player.equipment
    }));

    this.presenter.displayPlayers(players);
  }
}
