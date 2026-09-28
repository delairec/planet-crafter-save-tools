import {PlayersPresenterPort} from './ports/PlayersPresenterPort';
import {SaveSectionsReaderPort} from './ports/SaveSectionsReaderPort';
import {WorldObjectLabelsReaderPort} from './ports/WorldObjectLabelsReaderPort';
import {LoadSaveSectionsRequest} from './requests/LoadSaveSectionsRequest';
import {PlayerSummaryResponse} from './responses/PlayerSummaryResponse';

export class LoadPlayersSection {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly worldObjectLabelsReader: WorldObjectLabelsReaderPort,
    private readonly presenter: PlayersPresenterPort,
  ) {}

  async execute({content}: LoadSaveSectionsRequest): Promise<void> {
    const {saveSections, unreadableLines} = this.saveSectionsReader.read(content);

    if (unreadableLines.length > 0) {
      this.presenter.displaySaveWithUnreadableLines({unreadableLines});
      return;
    }

    const players = saveSections.getPlayers().map((player): PlayerSummaryResponse => ({
      name: player.name,
      inventory: player.inventory,
      equipment: player.equipment
    }));

    this.presenter.displayPlayers({players, worldObjectLabels: this.worldObjectLabelsReader.readWorldObjectLabels()});
  }
}
