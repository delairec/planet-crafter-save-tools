import {UnreadableLine} from "../../save/domain/save/SaveSectionLocation";
import {describe, expect, it, mock} from 'bun:test';
import {SAVE_CONTENT, stubSaveSectionsReader} from "../testing/stubSaveSectionsReader";
import {LoadPlayersPage} from './LoadPlayersPage';
import {EquipmentKindsReaderPort} from './ports/EquipmentKindsReaderPort';
import {OxygenTankCapacitiesReaderPort} from './ports/OxygenTankCapacitiesReaderPort';
import {PlayersPagePresenterPort} from './ports/PlayersPagePresenterPort';
import {SaveSectionsReaderPort} from './ports/SaveSectionsReaderPort';
import {WorldObjectLabelsReaderPort} from './ports/WorldObjectLabelsReaderPort';
import {PlayersPageResponse} from './responses/PlayersPageResponse';
import {WorldObjectLabelsResponse} from './responses/WorldObjectLabelsResponse';

const WORLD_OBJECT_LABELS: WorldObjectLabelsResponse = {Backpack4: 'Backpack T4'};

function createPresenter(): PlayersPagePresenterPort {
  return {displayPlayersPage: mock(), displaySaveWithUnreadableLines: mock()};
}

function createUseCase(saveSectionsReader: SaveSectionsReaderPort, presenter: PlayersPagePresenterPort): LoadPlayersPage {
  const worldObjectLabelsReader: WorldObjectLabelsReaderPort = {readWorldObjectLabels: () => WORLD_OBJECT_LABELS};
  const oxygenTankCapacitiesReader: OxygenTankCapacitiesReaderPort = {readOxygenTankCapacities: () => ({OxygenTank3: 280})};
  const equipmentKindsReader: EquipmentKindsReaderPort = {
    readEquipmentKinds: () => [
      {worldObjectName: 'OxygenTank3', kind: 'Oxygen tank', icon: 'oxygen-tank'},
      {worldObjectName: 'Backpack4', kind: 'Backpack', icon: 'backpack'}
    ]
  };

  return new LoadPlayersPage({saveSectionsReader, worldObjectLabelsReader, oxygenTankCapacitiesReader, equipmentKindsReader}, presenter);
}

describe('LoadPlayersPage', () => {
  it('should present a card per player, its gauges measured against the maximum its equipment gives, its equipment in slots and its inventory grouped', async () => {
    // Arrange
    const displayPlayersPage = mock<PlayersPagePresenterPort['displayPlayersPage']>();
    const presenter: PlayersPagePresenterPort = {displayPlayersPage, displaySaveWithUnreadableLines: mock()};
    const useCase = createUseCase(stubSaveSectionsReader(), presenter);

    // Act
    await useCase.execute({content: SAVE_CONTENT});

    // Assert
    expect(displayPlayersPage).toHaveBeenCalledTimes(1);
    expect<PlayersPageResponse>(displayPlayersPage.mock.calls[0][0]).toEqual({
      players: [
        {
          name: 'Nikowa',
          planet: 'Toxicity',
          isHost: true,
          gauges: {
            oxygen: {value: 140, maximum: 280, percentage: 50},
            health: {value: 72.5, maximum: 100, percentage: 72.5},
            thirst: {value: 96, maximum: 100, percentage: 96}
          },
          equipment: {
            slots: [{kind: 'Oxygen tank', icon: 'oxygen-tank', worldObjectName: 'OxygenTank3'}, {kind: 'Backpack', icon: 'backpack'}],
            wornCount: 1,
            slotCount: 2
          },
          inventory: {items: [{worldObjectName: 'Backpack4', count: 1}], itemCount: 1, slotCount: 12, kindCount: 1, freeSlotCount: 11}
        },
        {
          name: 'Chileny',
          planet: undefined,
          isHost: false,
          gauges: {
            oxygen: {value: 100, maximum: 100, percentage: 100},
            health: {value: 100, maximum: 100, percentage: 100},
            thirst: {value: 0, maximum: 100, percentage: 0}
          },
          equipment: {slots: [{kind: 'Oxygen tank', icon: 'oxygen-tank'}, {kind: 'Backpack', icon: 'backpack'}], wornCount: 0, slotCount: 2},
          inventory: {items: [], itemCount: 0, slotCount: 12, kindCount: 0, freeSlotCount: 12}
        }
      ],
      worldObjectLabels: {Backpack4: 'Backpack T4'}
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should display the unreadable lines instead of the players', async () => {
      // Arrange
      const unreadableLines: UnreadableLine[] = [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}];
      const presenter = createPresenter();
      const useCase = createUseCase(stubSaveSectionsReader({unreadableLines}), presenter);

      // Act
      await useCase.execute({content: SAVE_CONTENT});

      // Assert
      expect(presenter.displaySaveWithUnreadableLines).toHaveBeenCalledWith({unreadableLines: [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}]});
      expect(presenter.displayPlayersPage).not.toHaveBeenCalled();
    });
  });
});
