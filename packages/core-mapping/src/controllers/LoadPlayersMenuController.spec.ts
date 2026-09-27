import {describe, expect, it} from 'bun:test';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {LoadPlayersMenuController} from './LoadPlayersMenuController';
import {PlayersMenuViewModel} from '../presentation/viewModels/PlayersMenuViewModel';

describe('LoadPlayersMenuController', () => {
  it('should present the players menu of the parsed save', async () => {
    // Arrange
    const validatedContent = createFakeSaveContent();

    // Act
    const viewModel = await LoadPlayersMenuController.loadPlayersMenu(validatedContent);

    // Assert
    expect(viewModel).toEqual<PlayersMenuViewModel>({
      players: [{name: 'Nikowa', planet: 'Toxicity', hostBadge: 'Host'}]
    });
  });
});
