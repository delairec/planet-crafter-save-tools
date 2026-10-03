import {describe, expect, it} from 'bun:test';
import {createPowerNotifications} from "./createPowerNotifications";
import {NotificationViewModel} from "./viewModels/NotificationViewModel";

describe('createPowerNotifications', () => {
  describe('When the save takes the values of the current game release at the default power consumption', () => {
    it('should warn of the submerged machines alone', () => {
      // Act
      const notifications = createPowerNotifications({
        gameRelease: '2.103',
        gameReleaseIsEarlierThanCurrent: false,
        powerConsumptionModifier: 1,
        powerConsumptionIsModified: false
      });

      // Assert
      expect<NotificationViewModel[]>(notifications).toEqual([
        {severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'}
      ]);
    });
  });

  describe('When the save takes the values of an earlier game release and modifies the power consumption', () => {
    it('should name that game release, then the modifier the consumption applies', () => {
      // Act
      const notifications = createPowerNotifications({
        gameRelease: '2.004',
        gameReleaseIsEarlierThanCurrent: true,
        powerConsumptionModifier: 0.5,
        powerConsumptionIsModified: true
      });

      // Assert
      expect<NotificationViewModel[]>(notifications).toEqual([
        {severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'},
        {severity: 'warning', message: 'Values of game release 2.004'},
        {severity: 'information', message: 'Consumption applies the save\'s Power Consumption modifier: 50%'}
      ]);
    });
  });
});
