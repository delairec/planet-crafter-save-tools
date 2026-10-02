import {describe, expect, it} from 'bun:test';
import {createDroneLogisticsBadge} from "./createDroneLogisticsBadge";
import {TonedValueViewModel} from "./viewModels/ConfigurationPageViewModel";

describe('createDroneLogisticsBadge', () => {
  describe('When the drone logistics are paused', () => {
    it('should show them as penalising the player', () => {
      // Act
      const badge = createDroneLogisticsBadge({paused: true, effect: 'penalisesThePlayer'});

      // Assert
      expect<TonedValueViewModel>(badge).toEqual({value: 'Paused', tone: 'danger', toneLabel: 'penalises the player'});
    });
  });

  describe('When the drone logistics are running', () => {
    it('should show them as helping the player', () => {
      // Act
      const badge = createDroneLogisticsBadge({paused: false, effect: 'helpsThePlayer'});

      // Assert
      expect<TonedValueViewModel>(badge).toEqual({value: 'Running', tone: 'positive', toneLabel: 'helps the player'});
    });
  });
});
