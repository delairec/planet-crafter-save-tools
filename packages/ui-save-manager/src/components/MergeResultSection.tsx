import {Accessor, createEffect, createSignal, onCleanup, Show} from 'solid-js';
import {MergeResultViewModel} from 'core-mapping/presentation/viewModels/MergeResultViewModel';
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

interface MergeResultSectionProps {
  result: Accessor<MergeResultViewModel | null>;
}

export default function MergeResultSection(props: MergeResultSectionProps) {
  const [downloadUrl, setDownloadUrl] = createSignal<string | null>(null);
  let downloadFileUrl: string | null = null;

  createEffect(() => {
    const result = props.result();

    if (downloadFileUrl) {
      URL.revokeObjectURL(downloadFileUrl);
    }

    downloadFileUrl = result?.status === 'success' ? URL.createObjectURL(new Blob([result.content], {type: 'application/json'})) : null;
    setDownloadUrl(downloadFileUrl);
  });

  onCleanup(() => {
    if (downloadFileUrl) {
      URL.revokeObjectURL(downloadFileUrl);
    }
  });

  return (
    <Show when={props.result()}>
      {(result) => (
        <>
          <Show when={result().saveAWarnings.length > 0}>
            <ValidationMessagesList title={mergeResultSectionSaveAWarningsTitle} severity="warning"
                                    messages={result().saveAWarnings}/>
          </Show>
          <Show when={result().saveBWarnings.length > 0}>
            <ValidationMessagesList title={mergeResultSectionSaveBWarningsTitle} severity="warning"
                                    messages={result().saveBWarnings}/>
          </Show>

          <Show when={result().status === 'success'}>
            <p class="text-color-success">{mergeResultSectionSuccessMessage}</p>
            <p>{mergeResultSectionFileCreatedMessage} <code>{result().fileName}</code> <a class="button-link"
                                                                                          href={downloadUrl() ?? undefined}
                                                                                          download={result().fileName}>{mergeResultSectionDownloadLinkLabel}</a>
            </p>
            <Show when={result().mergeWarnings.length > 0}>
              <ValidationMessagesList title={mergeResultSectionMergeWarningsTitle} severity="warning"
                                      messages={result().mergeWarnings}/>
            </Show>
            <Show when={result().legacyFormatCouldBeKept}>
              <p>{mergeResultSectionKeepLegacyFormatReminder}</p>
            </Show>
            <Show when={result().mergeErrors.length > 0}>
              <ValidationMessagesList title={mergeResultSectionMergedSaveInvalidMessage} severity="danger"
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
                <ValidationMessagesList title={mergeResultSectionSaveAInvalidMessage} severity="danger"
                                        messages={result().saveAErrors}/>
              </Show>
              <Show when={result().saveBErrors.length > 0}>
                <ValidationMessagesList title={mergeResultSectionSaveBInvalidMessage} severity="danger"
                                        messages={result().saveBErrors}/>
              </Show>
            </div>
          </Show>
        </>
      )}
    </Show>
  );
}
