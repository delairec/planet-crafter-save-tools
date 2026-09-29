import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveSectionsReaderService} from "../testing/FakeSaveSectionsReaderService";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {PlayersPresenterPort} from "./ports/PlayersPresenterPort";
import {LoadPlayersSection} from './LoadPlayersSection';
import {PlayerSummaryResponse} from './responses/PlayerSummaryResponse';

describe('LoadPlayersSection', () => {
  it('should present all players from the parsed save', async () => {
    // Arrange
    const saveSectionsReader: SaveSectionsReaderPort = new FakeSaveSectionsReaderService();
    const displayPlayers = mock<PlayersPresenterPort['displayPlayers']>();
    const presenter: PlayersPresenterPort = {displayPlayers};
    const useCase = new LoadPlayersSection(saveSectionsReader, presenter);

    // Act
    await useCase.execute();

    // Assert
    expect(displayPlayers).toHaveBeenCalledTimes(1);
    expect<PlayerSummaryResponse[]>(displayPlayers.mock.calls[0][0]).toEqual([
      {name: 'Nikowa', equipment: [], inventory: []},
      {name: 'Chileny', equipment: [], inventory: []}
    ]);
  });
});
