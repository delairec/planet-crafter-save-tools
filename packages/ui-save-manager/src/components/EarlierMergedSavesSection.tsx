import {Accessor, For, Show} from 'solid-js';
import {KeptMergedSave} from '~/providers/MergedSavesProvider.tsx';
import {earlierMergedSavesTitle, mergeResultSectionDownloadLinkLabel} from '~/messages/mergeResultSectionMessages';

interface EarlierMergedSavesSectionProps {
  mergedSaves: Accessor<KeptMergedSave[]>;
}

export default function EarlierMergedSavesSection(props: EarlierMergedSavesSectionProps) {
  return (
    <Show when={props.mergedSaves().length > 0}>
      <section data-testid="earlier-merged-saves">
        <h3 data-testid="earlier-merged-saves-title">{earlierMergedSavesTitle}</h3>
        <ul>
          <For each={props.mergedSaves()}>
            {(mergedSave, index) => (
              <li data-testid={`earlier-merged-save-${index()}`}>
                <code data-testid={`earlier-merged-save-file-name-${index()}`}>{mergedSave.fileName}</code> <a class="button-link" data-testid={`earlier-merged-save-download-${index()}`}
                                                                                                href={mergedSave.downloadUrl}
                                                                                                download={mergedSave.fileName}>{mergeResultSectionDownloadLinkLabel}</a>
              </li>
            )}
          </For>
        </ul>
      </section>
    </Show>
  );
}
