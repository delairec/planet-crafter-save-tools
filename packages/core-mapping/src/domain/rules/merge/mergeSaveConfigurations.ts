import {SaveConfiguration} from 'shared-save-processing/gameDefinitions';

export interface SaveConfigurationOverrides {
  saveDisplayName: string;
  declaredVersion: string | undefined;
}

/**
 * @see @RULE.SaveConfigurationComesFromSaveA, @DECISION.TheMergedSaveDisplayNameComesFromTheCaller
 */
export function mergeSaveConfigurations(
  [saveConfigurationA]: SaveConfiguration[],
  [saveConfigurationB]: SaveConfiguration[],
  {saveDisplayName, declaredVersion}: SaveConfigurationOverrides
): SaveConfiguration | undefined {
  const saveConfiguration = saveConfigurationA ?? saveConfigurationB;
  if (!saveConfiguration) {
    return undefined;
  }

  return {...saveConfiguration, saveDisplayName, version: declaredVersion ?? saveConfiguration.version};
}
