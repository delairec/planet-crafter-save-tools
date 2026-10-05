import {EnergySettingsResponse} from "../../application/responses/EnergySettingsResponse";
import {NotificationViewModel} from "../viewModels/NotificationViewModel";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
import {
  energyLevelsSectionSubmergedMachinesNotification,
  resolveEnergyLevelsSectionGameReleaseNotification,
  resolveEnergyLevelsSectionPowerConsumptionModifierNotification
} from "../messages/energyLevelsSectionMessages.js";

export const submergedMachinesNotification: NotificationViewModel = {
  severity: 'limitation',
  message: energyLevelsSectionSubmergedMachinesNotification
};

export function createPowerNotifications(energySettings: EnergySettingsResponse): NotificationViewModel[] {
  const notifications: NotificationViewModel[] = [submergedMachinesNotification];

  if (energySettings.gameReleaseIsEarlierThanCurrent) {
    notifications.push({
      severity: 'warning',
      message: resolveEnergyLevelsSectionGameReleaseNotification(energySettings.gameRelease)
    });
  }

  if (energySettings.powerConsumptionIsModified) {
    notifications.push({
      severity: 'information',
      message: resolveEnergyLevelsSectionPowerConsumptionModifierNotification(
        formatNumber(energySettings.powerConsumptionModifier, FormatNumberStrategies.PERCENTAGE)
      )
    });
  }

  return notifications;
}
