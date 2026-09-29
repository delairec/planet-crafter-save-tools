import {UnreadableLine} from "./ports/SaveSectionLocation";
import {describe, expect, it, mock} from 'bun:test';
import {SAVE_CONTENT, stubSaveSectionsReader} from "../testing/stubSaveSectionsReader";
import {PlayersPresenterPort} from "./ports/PlayersPresenterPort";
import {LoadPlayersSection} from './LoadPlayersSection';
import {PlayersResponse} from './responses/PlayersResponse';
import {SaveSectionsReaderPort} from './ports/SaveSectionsReaderPort';
import {WorldObjectLabels, WorldObjectLabelsReaderPort} from './ports/WorldObjectLabelsReaderPort';

const WORLD_OBJECT_LABELS: WorldObjectLabels = {Backpack4: 'Backpack T4'};

function createPresenter(): PlayersPresenterPort {
  return {displayPlayers: mock(), displaySaveWithUnreadableLines: mock()};
}

function createUseCase(saveSectionsReader: SaveSectionsReaderPort, presenter: PlayersPresenterPort): LoadPlayersSection {
  const worldObjectLabelsReader: WorldObjectLabelsReaderPort = {readWorldObjectLabels: () => WORLD_OBJECT_LABELS};

  return new LoadPlayersSection(saveSectionsReader, worldObjectLabelsReader, presenter);
}

describe('LoadPlayersSection', () => {
  it('should present all players from the parsed save, with the labels of the world objects', async () => {
    // Arrange
    const displayPlayers = mock<PlayersPresenterPort['displayPlayers']>();
    const presenter: PlayersPresenterPort = {displayPlayers, displaySaveWithUnreadableLines: mock()};
    const useCase = createUseCase(stubSaveSectionsReader(), presenter);

    // Act
    await useCase.execute({content: SAVE_CONTENT});

    // Assert
    expect(displayPlayers).toHaveBeenCalledTimes(1);
    expect<PlayersResponse>(displayPlayers.mock.calls[0][0]).toEqual({
      players: [
        {name: 'Nikowa', equipment: [], inventory: []},
        {name: 'Chileny', equipment: [], inventory: []}
      ],
      worldObjectLabels: WORLD_OBJECT_LABELS
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should display the unreadable lines instead of the players', async () => {
      // Arrange
      const unreadableLines: UnreadableLine[] = [{section: {name: 'worldObjects', index: 3}, entryIndex: 2, line: '{not valid json'}];
      const presenter = createPresenter();
      const useCase = createUseCase(stubSaveSectionsReader({unreadableLines}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displaySaveWithUnreadableLines).toHaveBeenCalledWith([{section: {name: 'worldObjects', index: 3}, entryIndex: 2, line: '{not valid json'}]);
      expect(presenter.displayPlayers).not.toHaveBeenCalled();
    });
  });
});
