import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {PlayersMenuPresenterPort} from "./ports/PlayersMenuPresenterPort";
import {PlayerMenuEntryResponse} from "./responses/PlayerMenuEntryResponse";

export class LoadPlayersMenu {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly presenter: PlayersMenuPresenterPort
  ) {}

  async execute(): Promise<void> {
    const players = this.saveSectionsReader.getPlayers().map((player): PlayerMenuEntryResponse => ({
      name: player.name,
      planet: player.findPlanetStoodOn(),
      isHost: player.isHost
    }));

    this.presenter.displayPlayersMenu(players);
  }
}
