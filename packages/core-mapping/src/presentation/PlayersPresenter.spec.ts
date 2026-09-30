import {UnreadableLineResponse} from "../application/responses/UnreadableLineResponse";
import {describe, expect, it} from 'bun:test';
import {PlayersPresenter} from './PlayersPresenter';
import {PlayersViewModel} from './viewModels/PlayersViewModel';
import {WorldObjectLabelsResponse} from '../application/responses/WorldObjectLabelsResponse';

const WORLD_OBJECT_LABELS: WorldObjectLabelsResponse = {
  Backpack4: 'Backpack T4',
  MagnetarQuartz: 'Magnetar Quartz',
  OxygenTank5: 'Oxygen tank T5',
  Phytoplankton3: 'Phytoplankton C'
};

describe('PlayersPresenter', () => {
  it('should initialize with default view model', () => {
    // Act
    const presenter = new PlayersPresenter();

    // Assert
    expect(presenter.viewModel).toEqual<PlayersViewModel>({
      players: []
    });
  });

  it('should present all players', () => {
    // Arrange
    const presenter = new PlayersPresenter();
    const playerNikowa = {name: 'Nikowa', inventory: ['Phytoplankton3', 'MagnetarQuartz'], equipment: ['Backpack4', 'OxygenTank5']};
    const playerChileny = {name: 'Chileny', inventory: [], equipment: []};

    // Act
    presenter.displayPlayers({players: [playerNikowa, playerChileny], worldObjectLabels: WORLD_OBJECT_LABELS});

    // Assert
    expect(presenter.viewModel).toEqual<PlayersViewModel>({
      players: [
        {
          name: 'Nikowa',
          columns: [
            {
              header: 'Equipment',
              values: ['Backpack T4', 'Oxygen tank T5']
            },
            {
              header: 'Inventory',
              values: ['Phytoplankton C', 'Magnetar Quartz']
            }
          ]
        }, {
          name: 'Chileny',
          columns: [
            {
              header: 'Equipment',
              values: ['(/) No equipment']
            },
            {
              header: 'Inventory',
              values: ['(/) No items']
            }
          ]
        }]
    });
  });

  describe('When an item id is not found', () => {
    it('should use a placeholder value', () => {
      // Arrange
      const presenter = new PlayersPresenter();
      const playerNikowa = {name: 'Nikowa', inventory: ['Phytoplankton99'], equipment: ['Backpack99']};

      // Act
      presenter.displayPlayers({players: [playerNikowa], worldObjectLabels: WORLD_OBJECT_LABELS});

      // Assert
      expect(presenter.viewModel).toEqual<PlayersViewModel>({
        players: [
          {
            name: 'Nikowa',
            columns: [
              {
                header: 'Equipment',
                values: ['Unknown Item (Backpack99)']
              },
              {
                header: 'Inventory',
                values: ['Unknown Item (Phytoplankton99)']
              }
            ]
          }]
      });
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should show the unreadable lines in place of the players', () => {
      // Arrange
      const unreadableLines: UnreadableLineResponse[] = [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}];
      const presenter = new PlayersPresenter();

      // Act
      presenter.displaySaveWithUnreadableLines({unreadableLines});

      // Assert
      expect(presenter.viewModel).toEqual<PlayersViewModel>({players: [], unreadableLines: [{message: 'Invalid JSON: {not valid json', location: 'World objects (section 78), entry 2'}]});
    });
  });
});
