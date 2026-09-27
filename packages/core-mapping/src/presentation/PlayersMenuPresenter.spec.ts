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
});
