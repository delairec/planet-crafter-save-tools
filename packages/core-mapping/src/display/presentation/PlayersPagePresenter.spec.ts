import {UnreadableLineResponse} from "../../save/application/responses/UnreadableLineResponse";
import {describe, expect, it} from 'bun:test';
import {PlayersPagePresenter} from './PlayersPagePresenter';
import {PlayersPageViewModel} from './viewModels/PlayersPageViewModel';
import {PlayerCardResponse, PlayerGaugesResponse} from '../application/responses/PlayersPageResponse';
import {WorldObjectLabelsResponse} from '../application/responses/WorldObjectLabelsResponse';

const WORLD_OBJECT_LABELS: WorldObjectLabelsResponse = {
  Backpack4: 'Backpack T4',
  MagnetarQuartz: 'Magnetar Quartz',
  OxygenTank3: 'Oxygen tank T3'
};

const FULL_GAUGES: PlayerGaugesResponse = {
  oxygen: {value: 100, maximum: 100, percentage: 100},
  health: {value: 100, maximum: 100, percentage: 100},
  thirst: {value: 100, maximum: 100, percentage: 100}
};

function createPlayerCard(overrides: Partial<PlayerCardResponse> = {}): PlayerCardResponse {
  return {name: 'Chileny', planet: undefined, isHost: false, gauges: FULL_GAUGES, equipment: [], inventory: [], ...overrides};
}

describe('PlayersPagePresenter', () => {
  it('should hold no player before any outcome', () => {
    // Act
    const presenter = new PlayersPagePresenter();

    // Assert
    expect(presenter.viewModel).toEqual<PlayersPageViewModel>({players: []});
  });

  it('should present a card per player and count them', () => {
    // Arrange
    const presenter = new PlayersPagePresenter();
    const nikowa = createPlayerCard({
      name: 'Nikowa',
      planet: 'Toxicity',
      isHost: true,
      gauges: {
        oxygen: {value: 140.4, maximum: 280, percentage: 50.142857},
        health: {value: 72.67363739013672, maximum: 100, percentage: 72.67363739013672},
        thirst: {value: 450, maximum: 100, percentage: 100}
      },
      equipment: ['OxygenTank3'],
      inventory: ['Backpack4', 'MagnetarQuartz']
    });

    // Act
    presenter.displayPlayersPage({players: [nikowa, createPlayerCard()], worldObjectLabels: WORLD_OBJECT_LABELS});

    // Assert
    expect(presenter.viewModel).toEqual<PlayersPageViewModel>({
      playerCountHint: '2 in this save',
      players: [
        {
          name: 'Nikowa',
          planetLabel: 'on Toxicity',
          hostBadge: 'Host',
          gauges: [
            {kind: 'oxygen', label: 'Oxygen', percentageLabel: '50 %', fillPercentage: 50.142857, amount: '140 / 280'},
            {kind: 'health', label: 'Health', percentageLabel: '73 %', fillPercentage: 72.67363739013672, amount: '73 / 100'},
            {kind: 'thirst', label: 'Thirst', percentageLabel: '100 %', fillPercentage: 100, amount: '450 / 100'}
          ],
          columns: [
            {header: 'Equipment', values: ['Oxygen tank T3']},
            {header: 'Inventory', values: ['Backpack T4', 'Magnetar Quartz']}
          ]
        },
        {
          name: 'Chileny',
          gauges: [
            {kind: 'oxygen', label: 'Oxygen', percentageLabel: '100 %', fillPercentage: 100, amount: '100 / 100'},
            {kind: 'health', label: 'Health', percentageLabel: '100 %', fillPercentage: 100, amount: '100 / 100'},
            {kind: 'thirst', label: 'Thirst', percentageLabel: '100 %', fillPercentage: 100, amount: '100 / 100'}
          ],
          columns: [
            {header: 'Equipment', values: ['(/) No equipment']},
            {header: 'Inventory', values: ['(/) No items']}
          ]
        }
      ]
    });
  });

  describe('When an item has no label', () => {
    it('should name it as an unknown item', () => {
      // Arrange
      const presenter = new PlayersPagePresenter();
      const player = createPlayerCard({equipment: ['Backpack99'], inventory: ['Phytoplankton99']});

      // Act
      presenter.displayPlayersPage({players: [player], worldObjectLabels: WORLD_OBJECT_LABELS});

      // Assert
      expect(presenter.viewModel.players[0]?.columns).toEqual([
        {header: 'Equipment', values: ['Unknown Item (Backpack99)']},
        {header: 'Inventory', values: ['Unknown Item (Phytoplankton99)']}
      ]);
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should show the unreadable lines in place of the players', () => {
      // Arrange
      const unreadableLines: UnreadableLineResponse[] = [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}];
      const presenter = new PlayersPagePresenter();

      // Act
      presenter.displaySaveWithUnreadableLines({unreadableLines});

      // Assert
      expect(presenter.viewModel).toEqual<PlayersPageViewModel>({
        players: [],
        unreadableLines: [{message: 'Invalid JSON: {not valid json', location: 'World objects (section 78), entry 2'}]
      });
    });
  });
});
