import {Accessor, For, Show} from 'solid-js';
import IconButton from '~/components/structure/IconButton';
import {KeptMergedSave} from '~/providers/MergedSavesProvider.tsx';
import {
  crossIcon,
  homeMessageAttachmentsLabel,
  resolveRemoveMergedSaveButtonLabel
} from '~/messages/shellMessages';

interface HomeMessageAttachmentsProps {
  mergedSaves: Accessor<KeptMergedSave[]>;
  onRemove: (mergedSave: KeptMergedSave) => void;
}

export default function HomeMessageAttachments(props: HomeMessageAttachmentsProps) {
  return (
    <Show when={props.mergedSaves().length > 0}>
      <ul class="home-message-attachments" aria-label={homeMessageAttachmentsLabel} data-testid="home-merged-saves">
        <For each={props.mergedSaves()}>
          {(mergedSave, index) => (
            <li class="home-message-attachment">
              <a class="home-message-attachment-download" data-testid={`home-merged-save-download-${index()}`}
                 href={mergedSave.downloadUrl} download={mergedSave.fileName}>
                <svg class="home-message-attachment-clip" viewBox="0 0 24 24" aria-hidden="true">
                  <path transform="rotate(40 12 12)" d="M15 8v8a3 3 0 0 1-6 0V6a2 2 0 0 1 4 0v9a1 1 0 0 1-2 0V8"/>
                </svg>
                {mergedSave.fileName}
              </a>
              <IconButton class="home-message-attachment-remove" icon={crossIcon} label={resolveRemoveMergedSaveButtonLabel(mergedSave.fileName)}
                          testId={`home-merged-save-remove-${index()}`} onClick={() => props.onRemove(mergedSave)} disabled={false}/>
            </li>
          )}
        </For>
      </ul>
    </Show>
  );
}
