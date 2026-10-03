import {createSignal, onCleanup, onMount, Show} from 'solid-js';
import {loadAndValidateSaveFileController} from 'core-mapping/validation/composition/compositionRoot';
import {SaveValidationMessageViewModel} from 'core-mapping/save/presentation/viewModels/SaveValidationMessageViewModel';
import Spinner from '~/components/structure/Spinner';
import DropZone from '~/components/structure/DropZone';
import SaveFileField from '~/components/structure/SaveFileField';
import SectionTitle from '~/components/structure/SectionTitle';
import {selectFileInInput} from '~/lib/selectFileInInput';
import {yieldToPaint} from '~/lib/yieldToPaint';
import {
  displayRouteCallFailedMessage,
  displayRouteDisplayTitle,
  displayRouteFileInputLabel,
  displayRouteHint,
  displayRouteLoadingLabel,
  displayRouteSubmitButtonLabel
} from '~/messages/displayRouteMessages';
import {saveDropHint, tooManyFilesForOneSaveMessage} from '~/messages/dropZoneMessages';

export interface LoadSaveResult {
  fileName: string;
  fileSize: number;
  content: string;
  isValid: boolean;
  errors: SaveValidationMessageViewModel[];
  warnings: SaveValidationMessageViewModel[];
}

interface LoadSaveSectionProps {
  onLoadStarted: () => void;
  onLoadResult: (result: LoadSaveResult) => void;
}

export default function LoadSaveSection(props: LoadSaveSectionProps) {
  let fileInputElement!: HTMLInputElement;
  let isDisposed = false;
  onCleanup(() => {
    isDisposed = true;
  });

  const [isReady, setIsReady] = createSignal<boolean>(false);
  onMount(() => setIsReady(true));

  const [file, setFile] = createSignal<File | null>(null);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [hasLoadCallFailed, setHasLoadCallFailed] = createSignal<boolean>(false);

  const handleFileChange = (event: Event & {currentTarget: HTMLInputElement}) => {
    setHasLoadCallFailed(false);
    props.onLoadStarted();
    setFile(event.currentTarget.files?.[0] ?? null);
  };

  const handleVisualize = async () => {
    const selectedFile = file();
    if (!selectedFile) {
      return;
    }

    setHasLoadCallFailed(false);
    props.onLoadStarted();
    setIsLoading(true);
    try {
      await yieldToPaint();

      const content = await selectedFile.text();
      const viewModel = await loadAndValidateSaveFileController.loadAndValidateSaveFile(selectedFile.name, content);

      if (!isDisposed) {
        props.onLoadResult({
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          content,
          isValid: viewModel.status === 'valid',
          errors: viewModel.errors,
          warnings: viewModel.warnings
        });
      }
    } catch (error) {
      console.error(error);
      setHasLoadCallFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SectionTitle testId="display-title" hint={displayRouteHint}>{displayRouteDisplayTitle}</SectionTitle>
      <Show when={isReady()} fallback={<p class="text-color-muted">{displayRouteLoadingLabel}</p>}>
        <div class="card save-form">
          <DropZone label={displayRouteDisplayTitle} testId="display-area" maximumFileCount={1}
                    tooManyFilesMessage={tooManyFilesForOneSaveMessage} class="save-drop-area"
                    onFilesDropped={(files) => selectFileInInput(fileInputElement, files[0])}>
            <SaveFileField label={displayRouteFileInputLabel} testId="save-file" ref={fileInputElement} onChange={handleFileChange}/>
            <p class="text-color-muted" data-testid="display-drop-hint">{saveDropHint}</p>
          </DropZone>
          <div class="save-form-actions">
            <button class="button-neon-pink save-form-submit" data-testid="visualize" onClick={handleVisualize}
                    disabled={!file() || isLoading()}>{displayRouteSubmitButtonLabel}</button>
          </div>
          <Show when={isLoading()}>
            <Spinner testId="display-busy-indicator"/>
          </Show>
          <Show when={hasLoadCallFailed()}>
            <p class="text-color-danger" data-testid="display-failure-message">{displayRouteCallFailedMessage}</p>
          </Show>
        </div>
      </Show>
    </>
  );
}
