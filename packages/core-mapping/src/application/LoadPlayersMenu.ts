import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {PlayersMenuPresenterPort} from "./ports/PlayersMenuPresenterPort";
import {createPlayerMenuEntryValueObject} from "../domain/valueObjects/PlayerMenuEntryValueObject";

export class LoadPlayersMenu {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly presenter: PlayersMenuPresenterPort
  ) {}

  async execute(): Promise<void> {
    const players = this.saveSectionsReader.getPlayers().map((player) => createPlayerMenuEntryValueObject({
      name: player.name,
      planet: player.findPlanetStoodOn(),
      isHost: player.isHost
    }));

    this.presenter.displayPlayersMenu(players);
  }
}
