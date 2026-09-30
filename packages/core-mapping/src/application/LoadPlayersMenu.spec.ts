import {UnreadableLine} from "../domain/save/SaveSectionLocation";
import {describe, expect, it, mock} from 'bun:test';
import {SAVE_CONTENT, stubSaveSectionsReader} from "../testing/stubSaveSectionsReader";
import {PlayersMenuPresenterPort} from "./ports/PlayersMenuPresenterPort";
import {LoadPlayersMenu} from "./LoadPlayersMenu";
import {WORLD_OBJECTS_SECTION} from '../testing/saveSectionLocations';

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
      const unreadableLines: UnreadableLine[] = [{section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{not valid json'}];
      const presenter = createPresenter();
      const useCase = new LoadPlayersMenu(stubSaveSectionsReader({unreadableLines}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displaySaveWithUnreadableLines).toHaveBeenCalledWith({unreadableLines: [{section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{not valid json'}]});
      expect(presenter.displayPlayersMenu).not.toHaveBeenCalled();
    });
  });
});
