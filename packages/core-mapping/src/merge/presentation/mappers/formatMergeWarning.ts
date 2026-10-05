import type {MergeWarningResponse} from "../../application/responses/MergeWarningResponse";
import {SaveValidationMessageViewModel} from "../../../save/presentation/viewModels/SaveValidationMessageViewModel";
import {
  formatMergedSaveContentNewerThanFormatWarningMessage,
  formatMergedSaveFormatWarningMessage,
  formatMergedSaveSectionDroppedWarningMessage,
  unknownMergeWarningMessage
} from "../messages/mergeWarningMessages.js";

type MergeWarningMessageFormatters = {
  [Code in MergeWarningResponse['code']]: (warning: Extract<MergeWarningResponse, {code: Code}>) => string
};

const messageFormattersByWarningCode: MergeWarningMessageFormatters = {
  'merged-save-format': formatMergedSaveFormatWarningMessage,
  'merged-save-section-dropped': formatMergedSaveSectionDroppedWarningMessage,
  'merged-save-content-newer-than-format': formatMergedSaveContentNewerThanFormatWarningMessage
};

export function formatMergeWarning(warning: MergeWarningResponse): SaveValidationMessageViewModel {
  const formatMessage = messageFormattersByWarningCode[warning.code] as ((warning: MergeWarningResponse) => string) | undefined;

  return {message: formatMessage?.(warning) ?? unknownMergeWarningMessage, location: null};
}
