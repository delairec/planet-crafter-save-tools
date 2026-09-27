import {createSignal, onMount, Show} from 'solid-js';
import {A} from '@solidjs/router';
import MergeSection from "~/components/MergeSection";
import MergeResultSection from "~/components/MergeResultSection";
import {
  displayRouteCallFailedMessage,
  displayRouteDisplayTitle,
  displayRouteErrorsTitle,
  displayRouteFileInputLabel,
  displayRouteLoadingLabel,
  displayRouteParsedDataPlaceholder,
  displayRouteSubmitButtonLabel,
  displayRouteVisualizationTitle,
  displayRouteWarningsTitle
} from "~/messages/displayRouteMessages";
import {
  configurationPageTitle,
  powerPageTitle,
  resolveLoadedSaveTitle,
  terraformationPageTitle
} from "~/messages/shellMessages";
import ValidationMessagesList from "~/components/validation/ValidationMessagesList";
import Spinner from "~/components/structure/Spinner";
import DropZone from "~/components/structure/DropZone";
import SaveFileField from "~/components/structure/SaveFileField";
import {useLoadedSave} from "~/hooks/useLoadedSave.ts";
import {configurationPath, loadASaveAnchor, mergeTwoSavesAnchor, powerPath, terraformationPath} from "~/lib/pagePaths";
import {selectFileInInput} from "~/lib/selectFileInInput";
import {tooManyFilesForOneSaveMessage} from "~/messages/dropZoneMessages";

export default function Home() {
  let fileInputElement!: HTMLInputElement;

  const [isReady, setIsReady] = createSignal<boolean>(false);
  onMount(() => setIsReady(true));

  const {
    file,
    errors,
    warnings,
    mergeResult,
    isLoading,
    hasLoadCallFailed,
    isSaveLoaded,
    handleFileChange,
    handleSubmit,
    handleMergeStarted,
    handleSubmitMerge
  } = useLoadedSave();

  const handleMergeResult: typeof handleSubmitMerge = (result) => {
    handleSubmitMerge(result);
    fileInputElement.value = '';
  };

  return (
    <Show when={isReady()} fallback={<p class="text-color-muted">{displayRouteLoadingLabel}</p>}>
      <div id={loadASaveAnchor}>
        <DropZone label={displayRouteDisplayTitle} maximumFileCount={1}
                  tooManyFilesMessage={tooManyFilesForOneSaveMessage}
                  onFilesDropped={(files) => selectFileInInput(fileInputElement, files[0])}>
          <h2>{displayRouteDisplayTitle}</h2>
          <p class="save-file-row">
            <SaveFileField label={displayRouteFileInputLabel} ref={fileInputElement} onChange={handleFileChange}/>
            <button onClick={handleSubmit} disabled={!file() || isLoading()}>{displayRouteSubmitButtonLabel}</button>
          </p>
        </DropZone>
      </div>

      <Show when={isLoading()}>
        <Spinner/>
      </Show>
      <Show when={hasLoadCallFailed()}>
        <p class="text-color-danger">{displayRouteCallFailedMessage}</p>
      </Show>

      <div id={mergeTwoSavesAnchor}>
        <MergeSection onMergeStarted={handleMergeStarted} onMergeResult={handleMergeResult}/>
      </div>

      <h2>{displayRouteVisualizationTitle}</h2>

      <Show when={!errors().length && !isSaveLoaded() && !mergeResult()}>
        <p class="text-color-muted">{displayRouteParsedDataPlaceholder}</p>
      </Show>

      <MergeResultSection result={mergeResult}/>

      <Show when={errors().length}>
        <code>{file()?.name}</code>
        <ValidationMessagesList title={displayRouteErrorsTitle} severity="danger" messages={errors()}/>
      </Show>

      <Show when={warnings().length}>
        <code>{file()?.name}</code>
        <ValidationMessagesList title={displayRouteWarningsTitle} severity="warning" messages={warnings()}/>
      </Show>

      <Show when={isSaveLoaded() && file()}>
        {(loadedFile) => (
          <>
            <h3>{resolveLoadedSaveTitle(loadedFile().name)}</h3>
            <p class="overview-pages">
              <A href={configurationPath}>{configurationPageTitle}</A>
              <A href={powerPath}>{powerPageTitle}</A>
              <A href={terraformationPath}>{terraformationPageTitle}</A>
            </p>
          </>
        )}
      </Show>
    </Show>
  );
}
