import {SaveWarning, SaveWarningCode} from "shared-save-processing/gameDefinitions";
import {SaveValidationMessageViewModel} from "./viewModels/SaveFileValidationViewModel";
import {
  formatDeclaredReleaseContradictsContentWarningMessage,
  legacySaveFormatWarningMessage,
  unknownSaveWarningMessage
} from "./messages/saveWarningMessages.js";

type SaveWarningMessageFormatters = {
  [Code in SaveWarningCode]: (warning: Extract<SaveWarning, {code: Code}>) => string
};

/**
 * Every known warning code must have its own sentence: the mapped type makes a missing entry a
 * type error.
 */
const messageFormattersByWarningCode: SaveWarningMessageFormatters = {
  'legacy-save-format': () => legacySaveFormatWarningMessage,
  'declared-release-contradicts-content': formatDeclaredReleaseContradictsContentWarningMessage
};

/**
 * Turns a save warning into the warning shown to the user, in the same located shape as an error.
 * A code with no message falls back to a generic sentence, so the raw code is never displayed.
 * Warnings describe the save as a whole, hence a location that is always `null`.
 */
export function formatSaveWarning(warning: SaveWarning): SaveValidationMessageViewModel {
  const formatMessage = messageFormattersByWarningCode[warning.code] as ((warning: SaveWarning) => string) | undefined;

  return {message: formatMessage?.(warning) ?? unknownSaveWarningMessage, location: null};
}
