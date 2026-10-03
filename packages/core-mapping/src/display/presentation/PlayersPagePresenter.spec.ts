import {UnreadableLineResponse} from "../../save/application/responses/UnreadableLineResponse";
import {describe, expect, it} from 'bun:test';
import {PlayersPagePresenter} from './PlayersPagePresenter';
import {PlayersPageViewModel} from './viewModels/PlayersPageViewModel';
import {PlayerCardResponse, PlayerEquipmentResponse, PlayerGaugesResponse, PlayerInventoryResponse} from '../application/responses/PlayersPageResponse';
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

const NO_EQUIPMENT: PlayerEquipmentResponse = {slots: [{kind: 'Oxygen tank'}], wornCount: 0, slotCount: 1};

const EMPTY_INVENTORY: PlayerInventoryResponse = {items: [], itemCount: 0, slotCount: 12, kindCount: 0, freeSlotCount: 12};

function createPlayerCard(overrides: Partial<PlayerCardResponse> = {}): PlayerCardResponse {
  return {name: 'Chileny', planet: undefined, isHost: false, gauges: FULL_GAUGES, equipment: NO_EQUIPMENT, inventory: EMPTY_INVENTORY, ...overrides};
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
      equipment: {slots: [{kind: 'Oxygen tank', worldObjectName: 'OxygenTank3'}, {kind: 'Backpack'}], wornCount: 1, slotCount: 2},
      inventory: {
        items: [{worldObjectName: 'MagnetarQuartz', count: 2}, {worldObjectName: 'Backpack4', count: 1}],
        itemCount: 3,
        slotCount: 24,
        kindCount: 2,
        freeSlotCount: 21
      }
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
          equipment: {
            caption: 'Equipment · 1 of 2 slots',
            slots: [
              {kindLabel: 'Oxygen tank', itemLabel: 'Oxygen tank T3', isEmpty: false},
              {kindLabel: 'Backpack', itemLabel: 'Empty', isEmpty: true}
            ]
          },
          inventory: {
            caption: 'Inventory · 3 of 24 slots, 2 kinds',
            items: [{label: 'Magnetar Quartz', countLabel: '×2'}, {label: 'Backpack T4', countLabel: '×1'}],
            emptySlots: {label: 'Empty slots', countLabel: '×21'}
          }
        },
        {
          name: 'Chileny',
          gauges: [
            {kind: 'oxygen', label: 'Oxygen', percentageLabel: '100 %', fillPercentage: 100, amount: '100 / 100'},
            {kind: 'health', label: 'Health', percentageLabel: '100 %', fillPercentage: 100, amount: '100 / 100'},
            {kind: 'thirst', label: 'Thirst', percentageLabel: '100 %', fillPercentage: 100, amount: '100 / 100'}
          ],
          equipment: {
            caption: 'Equipment · 0 of 1 slots',
            slots: [{kindLabel: 'Oxygen tank', itemLabel: 'Empty', isEmpty: true}]
          },
          inventory: {
            caption: 'Inventory · 0 of 12 slots, 0 kinds',
            items: [],
            emptySlots: {label: 'Empty slots', countLabel: '×12'}
          }
        }
      ]
    });
  });

  describe('When an item has no label', () => {
    it('should name it as an unknown item in its slot and in its chip', () => {
      // Arrange
      const presenter = new PlayersPagePresenter();
      const player = createPlayerCard({
        equipment: {slots: [{kind: 'Backpack', worldObjectName: 'Backpack99'}], wornCount: 1, slotCount: 1},
        inventory: {items: [{worldObjectName: 'Phytoplankton99', count: 1}], itemCount: 1, slotCount: 12, kindCount: 1, freeSlotCount: 11}
      });

      // Act
      presenter.displayPlayersPage({players: [player], worldObjectLabels: WORLD_OBJECT_LABELS});

      // Assert
      expect(presenter.viewModel.players[0]?.equipment.slots[0]?.itemLabel).toBe('Unknown Item (Backpack99)');
      expect(presenter.viewModel.players[0]?.inventory.items[0]?.label).toBe('Unknown Item (Phytoplankton99)');
    });
  });

  describe('When a worn item has no equipment kind', () => {
    it('should place it in a slot of another kind', () => {
      // Arrange
      const presenter = new PlayersPagePresenter();
      const player = createPlayerCard({equipment: {slots: [{worldObjectName: 'OxygenTank3'}], wornCount: 1, slotCount: 1}});

      // Act
      presenter.displayPlayersPage({players: [player], worldObjectLabels: WORLD_OBJECT_LABELS});

      // Assert
      expect(presenter.viewModel.players[0]?.equipment.slots[0]?.kindLabel).toBe('Other');
    });
  });

  describe('When the inventory holds a single kind', () => {
    it('should count one kind in the caption', () => {
      // Arrange
      const presenter = new PlayersPagePresenter();
      const player = createPlayerCard({inventory: {items: [{worldObjectName: 'Backpack4', count: 2}], itemCount: 2, slotCount: 12, kindCount: 1, freeSlotCount: 10}});

      // Act
      presenter.displayPlayersPage({players: [player], worldObjectLabels: WORLD_OBJECT_LABELS});

      // Assert
      expect(presenter.viewModel.players[0]?.inventory.caption).toBe('Inventory · 2 of 12 slots, 1 kind');
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
