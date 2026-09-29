import {SaveConfigurationEntry} from '../../save/SaveConfigurationEntry';

export interface SaveConfigurationOverrides {
  saveDisplayName: string;
  declaredVersion: string | undefined;
}

/**
 * @see @RULE.SaveConfigurationComesFromSaveA, @DECISION.TheMergedSaveDisplayNameComesFromTheCaller
 */
export function mergeSaveConfigurations(
  [saveConfigurationA]: readonly SaveConfigurationEntry[],
  [saveConfigurationB]: readonly SaveConfigurationEntry[],
  {saveDisplayName, declaredVersion}: SaveConfigurationOverrides
): SaveConfigurationEntry | undefined {
  const saveConfiguration = saveConfigurationA ?? saveConfigurationB;
  if (!saveConfiguration) {
    return undefined;
  }

  return {...saveConfiguration, saveDisplayName, version: declaredVersion ?? saveConfiguration.version};
}
