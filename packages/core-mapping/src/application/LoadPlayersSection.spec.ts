import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveParserService} from "../testing/FakeSaveParserService";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {PlayersPresenterPort} from "./ports/PlayersPresenterPort";
import {LoadPlayersSection} from './LoadPlayersSection';
import {PlayerEntity} from '../domain/entities/PlayerEntity';

describe('LoadPlayersSection', () => {
  it('should present all players from the parsed save', async () => {
    // Arrange
    const saveParser: SaveSectionsReaderPort = new FakeSaveParserService();
    const presenter: PlayersPresenterPort = {displayPlayers: mock()};
    const useCase = new LoadPlayersSection(saveParser, presenter);

    // Act
    await useCase.execute();

    // Assert
    expect(presenter.displayPlayers).toHaveBeenCalledTimes(1);
    expect(presenter.displayPlayers).toHaveBeenCalledWith([new PlayerEntity({
      name: 'Nikowa',
      equipment: [],
      inventory: []
    }), new PlayerEntity({
      name: 'Chileny',
      equipment: [],
      inventory: []
    })]);
  });
});
