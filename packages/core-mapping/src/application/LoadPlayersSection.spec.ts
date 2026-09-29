import {UnreadableLine} from "./ports/SaveSectionLocation";
import {describe, expect, it, mock} from 'bun:test';
import {SAVE_CONTENT, stubSaveSectionsReader} from "../testing/stubSaveSectionsReader";
import {PlayersPresenterPort} from "./ports/PlayersPresenterPort";
import {LoadPlayersSection} from './LoadPlayersSection';
import {PlayerSummaryResponse} from './responses/PlayerSummaryResponse';

function createPresenter(): PlayersPresenterPort {
  return {displayPlayers: mock(), displaySaveWithUnreadableLines: mock()};
}

describe('LoadPlayersSection', () => {
  it('should present all players from the parsed save', async () => {
    // Arrange
    const displayPlayers = mock<PlayersPresenterPort['displayPlayers']>();
    const presenter: PlayersPresenterPort = {displayPlayers, displaySaveWithUnreadableLines: mock()};
    const useCase = new LoadPlayersSection(stubSaveSectionsReader(), presenter);

    // Act
    await useCase.execute({content: SAVE_CONTENT});

    // Assert
    expect(displayPlayers).toHaveBeenCalledTimes(1);
    expect<PlayerSummaryResponse[]>(displayPlayers.mock.calls[0][0]).toEqual([
      {name: 'Nikowa', equipment: [], inventory: []},
      {name: 'Chileny', equipment: [], inventory: []}
    ]);
  });

  describe('When the save has unreadable lines', () => {
    it('should display the unreadable lines instead of the players', async () => {
      // Arrange
      const unreadableLines: UnreadableLine[] = [{section: {name: 'worldObjects', index: 3}, entryIndex: 2, line: '{not valid json'}];
      const presenter = createPresenter();
      const useCase = new LoadPlayersSection(stubSaveSectionsReader({unreadableLines}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displaySaveWithUnreadableLines).toHaveBeenCalledWith([{section: {name: 'worldObjects', index: 3}, entryIndex: 2, line: '{not valid json'}]);
      expect(presenter.displayPlayers).not.toHaveBeenCalled();
    });
  });
});
