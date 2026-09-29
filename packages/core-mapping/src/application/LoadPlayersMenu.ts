import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {LoadSaveSectionsRequest} from "./requests/LoadSaveSectionsRequest";
import {PlayersMenuPresenterPort} from "./ports/PlayersMenuPresenterPort";
import {PlayerMenuEntryResponse} from "./responses/PlayerMenuEntryResponse";

export class LoadPlayersMenu {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly presenter: PlayersMenuPresenterPort
  ) {}

  async execute({content}: LoadSaveSectionsRequest): Promise<void> {
    const {saveSections, unreadableLines} = this.saveSectionsReader.read(content);

    if (unreadableLines.length > 0) {
      this.presenter.displaySaveWithUnreadableLines(unreadableLines);
      return;
    }

    const players = saveSections.getPlayers().map((player): PlayerMenuEntryResponse => ({
      name: player.name,
      planet: player.findPlanetStoodOn(),
      isHost: player.isHost
    }));

    this.presenter.displayPlayersMenu(players);
  }
}
