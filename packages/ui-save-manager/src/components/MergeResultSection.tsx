import {Accessor, Show} from 'solid-js';
import {MergeResultViewModel} from 'core-mapping/merge/presentation/viewModels/MergeResultViewModel';
import {
  mergeResultSectionDownloadLinkLabel,
  mergeResultSectionFileCreatedMessage,
  mergeResultSectionKeepLegacyFormatReminder,
  mergeResultSectionMergedSaveInvalidMessage,
  mergeResultSectionMergeFailedTitle,
  mergeResultSectionMergeWarningsTitle,
  mergeResultSectionSaveAInvalidMessage,
  mergeResultSectionSaveAWarningsTitle,
  mergeResultSectionSaveBInvalidMessage,
  mergeResultSectionSaveBWarningsTitle,
  mergeResultSectionSuccessMessage
} from '~/messages/mergeResultSectionMessages';
import ValidationMessagesList from "~/components/validation/ValidationMessagesList";
import {KeptMergedSave} from "~/providers/MergedSavesProvider.tsx";

interface MergeResultSectionProps {
  result: Accessor<MergeResultViewModel | null>;
  mergedSave: Accessor<KeptMergedSave | null>;
}

export default function MergeResultSection(props: MergeResultSectionProps) {
  return (
    <Show when={props.result()}>
      {(result) => (
        <>
          <Show when={result().saveAWarnings.length > 0}>
            <ValidationMessagesList title={mergeResultSectionSaveAWarningsTitle} testId="save-a-warnings" severity="warning"
                                    messages={result().saveAWarnings}/>
          </Show>
          <Show when={result().saveBWarnings.length > 0}>
            <ValidationMessagesList title={mergeResultSectionSaveBWarningsTitle} testId="save-b-warnings" severity="warning"
                                    messages={result().saveBWarnings}/>
          </Show>

          <Show when={result().status === 'success'}>
            <Show when={result().mergeWarnings.length > 0}>
              <ValidationMessagesList title={mergeResultSectionMergeWarningsTitle} testId="merge-warnings" severity="warning"
                                      messages={result().mergeWarnings}/>
            </Show>
            <Show when={result().legacyFormatCouldBeKept}>
              <p data-testid="keep-legacy-format-reminder">{mergeResultSectionKeepLegacyFormatReminder}</p>
            </Show>
            <p class="text-color-success" data-testid="merge-success-message">{mergeResultSectionSuccessMessage}</p>
            <p>{mergeResultSectionFileCreatedMessage} <code data-testid="merged-file-name">{result().fileName}</code> <a class="button-link" data-testid="merged-save-download"
                                                                                          href={props.mergedSave()?.downloadUrl}
                                                                                          download={result().fileName}>{mergeResultSectionDownloadLinkLabel}</a>
            </p>
            <Show when={result().mergeErrors.length > 0}>
              <ValidationMessagesList title={mergeResultSectionMergedSaveInvalidMessage} testId="merged-save-errors" severity="danger"
                                      messages={result().mergeErrors}/>
            </Show>
          </Show>

          <Show when={result().status === 'mergeFailed'}>
            <p class="text-color-danger">{mergeResultSectionMergeFailedTitle}</p>
            <p>{result().mergeFailureMessage}</p>
          </Show>

          <Show when={result().status === 'validationError'}>
            <div>
              <Show when={result().saveAErrors.length > 0}>
                <ValidationMessagesList title={mergeResultSectionSaveAInvalidMessage} testId="save-a-errors" severity="danger"
                                        messages={result().saveAErrors}/>
              </Show>
              <Show when={result().saveBErrors.length > 0}>
                <ValidationMessagesList title={mergeResultSectionSaveBInvalidMessage} testId="save-b-errors" severity="danger"
                                        messages={result().saveBErrors}/>
              </Show>
            </div>
          </Show>
        </>
      )}
    </Show>
  );
}
