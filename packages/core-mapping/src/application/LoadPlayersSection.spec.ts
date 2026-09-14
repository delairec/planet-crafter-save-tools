import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveSectionsReaderService} from "../testing/FakeSaveSectionsReaderService";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {PlayersPresenterPort} from "./ports/PlayersPresenterPort";
import {LoadPlayersSection} from './LoadPlayersSection';
import {createPlayerSummaryValueObject} from '../domain/valueObjects/PlayerSummaryValueObject';

describe('LoadPlayersSection', () => {
  it('should present all players from the parsed save', async () => {
    // Arrange
    const saveSectionsReader: SaveSectionsReaderPort = new FakeSaveSectionsReaderService();
    const presenter: PlayersPresenterPort = {displayPlayers: mock()};
    const useCase = new LoadPlayersSection(saveSectionsReader, presenter);

    // Act
    await useCase.execute();

    // Assert
    expect(presenter.displayPlayers).toHaveBeenCalledTimes(1);
    expect(presenter.displayPlayers).toHaveBeenCalledWith([createPlayerSummaryValueObject({
      name: 'Nikowa',
      equipment: [],
      inventory: []
    }), createPlayerSummaryValueObject({
      name: 'Chileny',
      equipment: [],
      inventory: []
    })]);
  });
});
