import {MergeWarning} from "../application/responses/MergeWarning";
import {SaveValidationMessageViewModel} from "./viewModels/SaveFileValidationViewModel";
import {
  formatMergedSaveContentNewerThanFormatWarningMessage,
  formatMergedSaveFormatWarningMessage,
  formatMergedSaveSectionDroppedWarningMessage,
  unknownMergeWarningMessage
} from "./messages/mergeWarningMessages.js";

type MergeWarningMessageFormatters = {
  [Code in MergeWarning['code']]: (warning: Extract<MergeWarning, {code: Code}>) => string
};

const messageFormattersByWarningCode: MergeWarningMessageFormatters = {
  'merged-save-format': formatMergedSaveFormatWarningMessage,
  'merged-save-section-dropped': formatMergedSaveSectionDroppedWarningMessage,
  'merged-save-content-newer-than-format': formatMergedSaveContentNewerThanFormatWarningMessage
};

export function formatMergeWarning(warning: MergeWarning): SaveValidationMessageViewModel {
  const formatMessage = messageFormattersByWarningCode[warning.code] as ((warning: MergeWarning) => string) | undefined;

  return {message: formatMessage?.(warning) ?? unknownMergeWarningMessage, location: null};
}
