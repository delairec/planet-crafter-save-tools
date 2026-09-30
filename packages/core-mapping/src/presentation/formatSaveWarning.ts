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

const messageFormattersByWarningCode: SaveWarningMessageFormatters = {
  'legacy-save-format': () => legacySaveFormatWarningMessage,
  'declared-release-contradicts-content': formatDeclaredReleaseContradictsContentWarningMessage
};

export function formatSaveWarning(warning: SaveWarning): SaveValidationMessageViewModel {
  const formatMessage = messageFormattersByWarningCode[warning.code] as ((warning: SaveWarning) => string) | undefined;

  return {message: formatMessage?.(warning) ?? unknownSaveWarningMessage, location: null};
}
