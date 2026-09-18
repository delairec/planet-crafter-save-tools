import {SaveConfiguration} from 'shared-save-processing/gameDefinitions';

/**
 * @see @RULE.SaveConfigurationComesFromSaveA, @DECISION.TheMergedSaveDisplayNameComesFromTheCaller
 */
export function mergeSaveConfigurations([saveConfigurationA]: SaveConfiguration[], [saveConfigurationB]: SaveConfiguration[], saveDisplayName: string): SaveConfiguration | undefined {
  const saveConfiguration = saveConfigurationA ?? saveConfigurationB;
  if (!saveConfiguration) {
    return undefined;
  }

  return {...saveConfiguration, saveDisplayName};
}
