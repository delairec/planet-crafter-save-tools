import {createSignal, onMount, Show} from 'solid-js';
import Spinner from '~/components/structure/Spinner';
import DropZone from '~/components/structure/DropZone';
import SaveFileField from '~/components/structure/SaveFileField';
import ValidationMessagesList from '~/components/validation/ValidationMessagesList';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {selectFileInInput} from '~/lib/selectFileInInput';
import {
  displayRouteCallFailedMessage,
  displayRouteDisplayTitle,
  displayRouteErrorsTitle,
  displayRouteFileInputLabel,
  displayRouteLoadingLabel,
  displayRouteSubmitButtonLabel,
  displayRouteWarningsTitle
} from '~/messages/displayRouteMessages';
import {tooManyFilesForOneSaveMessage} from '~/messages/dropZoneMessages';

interface LoadSaveSectionProps {
  onSaveLoaded?: () => void;
}

export default function LoadSaveSection(props: LoadSaveSectionProps) {
  let fileInputElement!: HTMLInputElement;

  const [isReady, setIsReady] = createSignal<boolean>(false);
  onMount(() => setIsReady(true));

  const {file, errors, warnings, isLoading, hasLoadCallFailed, isSaveLoaded, handleFileChange, handleSubmit} =
    useLoadedSave();

  const handleVisualize = async () => {
    await handleSubmit();
    if (isSaveLoaded()) {
      props.onSaveLoaded?.();
    }
  };

  return (
    <Show when={isReady()} fallback={<p class="text-color-muted">{displayRouteLoadingLabel}</p>}>
      <DropZone label={displayRouteDisplayTitle} testId="display-area" maximumFileCount={1}
                tooManyFilesMessage={tooManyFilesForOneSaveMessage}
                onFilesDropped={(files) => selectFileInInput(fileInputElement, files[0])}>
        <h2>{displayRouteDisplayTitle}</h2>
        <p class="save-file-row">
          <SaveFileField label={displayRouteFileInputLabel} testId="save-file" ref={fileInputElement} onChange={handleFileChange}/>
          <button data-testid="visualize" onClick={handleVisualize} disabled={!file() || isLoading()}>{displayRouteSubmitButtonLabel}</button>
        </p>
      </DropZone>

      <Show when={isLoading()}>
        <Spinner testId="display-busy-indicator"/>
      </Show>
      <Show when={hasLoadCallFailed()}>
        <p class="text-color-danger" data-testid="display-failure-message">{displayRouteCallFailedMessage}</p>
      </Show>

      <Show when={!isSaveLoaded()}>
        <Show when={errors().length}>
          <code>{file()?.name}</code>
          <ValidationMessagesList title={displayRouteErrorsTitle} testId="display-errors" severity="danger" messages={errors()}/>
        </Show>
        <Show when={warnings().length}>
          <code>{file()?.name}</code>
          <ValidationMessagesList title={displayRouteWarningsTitle} testId="display-warnings" severity="warning" messages={warnings()}/>
        </Show>
      </Show>
    </Show>
  );
}
