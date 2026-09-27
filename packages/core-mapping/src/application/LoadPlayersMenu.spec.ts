import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveSectionsReaderService} from "../testing/FakeSaveSectionsReaderService";
import {PlayersMenuPresenterPort} from "./ports/PlayersMenuPresenterPort";
import {LoadPlayersMenu} from "./LoadPlayersMenu";

describe('LoadPlayersMenu', () => {
  it('should present the players menu', async () => {
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
});
