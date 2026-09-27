import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveSectionsReaderService} from "../testing/FakeSaveSectionsReaderService";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {PlayersMenuPresenterPort} from "./ports/PlayersMenuPresenterPort";
import {LoadPlayersMenu} from "./LoadPlayersMenu";
import {PlayerMenuEntryValueObject} from "../domain/valueObjects/PlayerMenuEntryValueObject";

describe('LoadPlayersMenu', () => {
  it('should present each player with the planet it stands on and whether it hosts', async () => {
    // Arrange
    const presenter: PlayersMenuPresenterPort = {displayPlayersMenu: mock()};
    const useCase = new LoadPlayersMenu(new FakeSaveSectionsReaderService(), presenter);

    // Act
    await useCase.execute();

    // Assert
    expect(presenter.displayPlayersMenu).toHaveBeenCalledWith([
      {name: 'Nikowa', planet: 'Toxicity', isHost: true},
      {name: 'Chileny', planet: undefined, isHost: false}
    ]);
  });

  describe('When the save is in the legacy format', () => {
    it('should present no planet for any player', async () => {
      // Arrange
      const saveSectionsReader: SaveSectionsReaderPort = new FakeSaveSectionsReaderService();
      saveSectionsReader.isLegacySave = () => true;
      const presenter: PlayersMenuPresenterPort = {displayPlayersMenu: mock()};
      const useCase = new LoadPlayersMenu(saveSectionsReader, presenter);

      // Act
      await useCase.execute();

      // Assert
      expect(presenter.displayPlayersMenu).toHaveBeenCalledWith([
        {name: 'Nikowa', planet: undefined, isHost: true},
        {name: 'Chileny', planet: undefined, isHost: false}
      ]);
    });
  });
});
