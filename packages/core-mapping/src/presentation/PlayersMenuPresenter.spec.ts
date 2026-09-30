import {UnreadableLine} from "../domain/save/SaveSectionLocation";
import {describe, expect, it} from 'bun:test';
import {PlayersMenuPresenter} from "./PlayersMenuPresenter";
import {PlayersMenuViewModel} from "./viewModels/PlayersMenuViewModel";

describe('PlayersMenuPresenter', () => {
  it('should show the players menu', () => {
    // Arrange
    const presenter = new PlayersMenuPresenter();

    // Act
    presenter.displayPlayersMenu([
      {name: 'Nikowa', planet: 'Toxicity', isHost: true},
      {name: 'Chileny', planet: 'Humble', isHost: false}
    ]);

    // Assert
    expect(presenter.viewModel).toEqual<PlayersMenuViewModel>({
      players: [
        {name: 'Nikowa', planet: 'Toxicity', hostBadge: 'Host'},
        {name: 'Chileny', planet: 'Humble'}
      ]
    });
  });

  describe('When a player stands on no known planet', () => {
    it('should show the player without a planet', () => {
      // Arrange
      const presenter = new PlayersMenuPresenter();

      // Act
      presenter.displayPlayersMenu([{name: 'Sakia', planet: undefined, isHost: false}]);

      // Assert
      expect(presenter.viewModel).toEqual<PlayersMenuViewModel>({players: [{name: 'Sakia'}]});
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should show the unreadable lines in place of the players menu', () => {
      // Arrange
      const unreadableLines: UnreadableLine[] = [{section: {name: 'worldObjects', index: 3}, entryIndex: 2, line: '{not valid json'}];
      const presenter = new PlayersMenuPresenter();

      // Act
      presenter.displaySaveWithUnreadableLines({unreadableLines});

      // Assert
      expect(presenter.viewModel).toEqual<PlayersMenuViewModel>({players: [], unreadableLines: [{message: 'Invalid JSON: {not valid json', location: 'World objects (section 3), entry 2'}]});
    });
  });
});
