import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {describe, expect, it, mock} from 'bun:test';
import {SAVE_CONTENT, stubSaveSectionsReader} from "../testing/stubSaveSectionsReader";
import {PlayersMenuPresenterPort} from "./ports/PlayersMenuPresenterPort";
import {LoadPlayersMenu} from "./LoadPlayersMenu";

function createPresenter(): PlayersMenuPresenterPort {
  return {displayPlayersMenu: mock(), displaySaveWithUnreadableLines: mock()};
}

describe('LoadPlayersMenu', () => {
  it('should present the players menu', async () => {
    // Arrange
    const presenter = createPresenter();
    const useCase = new LoadPlayersMenu(stubSaveSectionsReader(), presenter);

    // Act
    await useCase.execute({content: SAVE_CONTENT});

    // Assert
    expect(presenter.displayPlayersMenu).toHaveBeenCalledWith([
      {name: 'Nikowa', planet: 'Toxicity', isHost: true},
      {name: 'Chileny', planet: undefined, isHost: false}
    ]);
  });

  describe('When the save has unreadable lines', () => {
    it('should display the unreadable lines instead of the players menu', async () => {
      // Arrange
      const unreadableLines: SaveParseError[] = [{detail: 'Entry is not valid JSON', section: 3, entryIndex: 2}];
      const presenter = createPresenter();
      const useCase = new LoadPlayersMenu(stubSaveSectionsReader({unreadableLines}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displaySaveWithUnreadableLines).toHaveBeenCalledWith([{detail: 'Entry is not valid JSON', section: 3, entryIndex: 2}]);
      expect(presenter.displayPlayersMenu).not.toHaveBeenCalled();
    });
  });
});
