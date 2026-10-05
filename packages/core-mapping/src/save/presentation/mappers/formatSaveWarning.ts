import type {SaveWarningResponse} from "../../application/responses/SaveWarningResponse";
import {SaveValidationMessageViewModel} from "../viewModels/SaveValidationMessageViewModel";
import {
  formatDeclaredReleaseContradictsContentWarningMessage,
  legacySaveFormatWarningMessage,
  unknownSaveWarningMessage
} from "../messages/saveWarningMessages.js";

type SaveWarningMessageFormatters = {
  [Code in SaveWarningResponse['code']]: (warning: Extract<SaveWarningResponse, {code: Code}>) => string
};

const messageFormattersByWarningCode: SaveWarningMessageFormatters = {
  'legacy-save-format': () => legacySaveFormatWarningMessage,
  'declared-release-contradicts-content': formatDeclaredReleaseContradictsContentWarningMessage
};

export function formatSaveWarning(warning: SaveWarningResponse): SaveValidationMessageViewModel {
  const formatMessage = messageFormattersByWarningCode[warning.code] as ((warning: SaveWarningResponse) => string) | undefined;

  return {message: formatMessage?.(warning) ?? unknownSaveWarningMessage, location: null};
}
