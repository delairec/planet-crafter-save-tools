import {createSignal, Show} from 'solid-js';
import {MergeSaveFilesController} from 'core-mapping/controllers/MergeSaveFilesController';
import {MergeResultViewModel} from 'core-mapping/presentation/viewModels/MergeResultViewModel';
import Spinner from '~/components/structure/Spinner';
import DropZone from '~/components/structure/DropZone';
import Icon from '~/components/Icon';
import {yieldToPaint} from '~/lib/yieldToPaint';
import {selectFileInInput} from '~/lib/selectFileInInput';
import {orderDroppedSaves} from '~/lib/orderDroppedSaves';
import {
  mergeButtonLabel,
  mergeSectionCallFailedMessage,
  mergeSectionPreferLegacyFormatLabel,
  mergeSectionSaveAAreaLabel,
  mergeSectionSaveALabel,
  mergeSectionSaveBAreaLabel,
  mergeSectionSaveBLabel,
  mergeSectionSwapButtonLabel,
  mergeSectionSwapIcon,
  mergeSectionTitle
} from '~/messages/mergeSectionMessages';
import {tooManyFilesForOneSaveMessage, tooManyFilesForTwoSavesMessage} from '~/messages/dropZoneMessages';

interface MergeSectionProps {
  onMergeStarted: () => void;
  onMergeResult: (result: MergeResultViewModel) => void;
}

export default function MergeSection(props: MergeSectionProps) {
  let saveAInput!: HTMLInputElement;
  let saveBInput!: HTMLInputElement;

  const [fileA, setFileA] = createSignal<File | null>(null);
  const [fileB, setFileB] = createSignal<File | null>(null);
  const [preferLegacyFormat, setPreferLegacyFormat] = createSignal<boolean>(false);
  const [isMerging, setIsMerging] = createSignal<boolean>(false);
  const [hasMergeCallFailed, setHasMergeCallFailed] = createSignal<boolean>(false);

  const handleSavesDropped = (files: File[]) => {
    const [firstSave, secondSave] = orderDroppedSaves(files);
    if (!secondSave) {
      selectFileInInput(fileA() ? saveBInput : saveAInput, firstSave);
      return;
    }
    selectFileInInput(saveAInput, firstSave);
    selectFileInInput(saveBInput, secondSave);
  };

  const handleSwap = () => {
    const previousFileA = fileA() ?? undefined;
    selectFileInInput(saveAInput, fileB() ?? undefined);
    selectFileInInput(saveBInput, previousFileA);
  };

  const handleMerge = async () => {
    const savedFileA = fileA();
    const savedFileB = fileB();
    if (!savedFileA || !savedFileB) {
      return;
    }

    setHasMergeCallFailed(false);
    props.onMergeStarted();
    setIsMerging(true);
    try {
      await yieldToPaint();

      const [contentA, contentB] = await Promise.all([savedFileA.text(), savedFileB.text()]);
      const viewModel = await MergeSaveFilesController.mergeSaveFiles({
        fileNameA: savedFileA.name,
        contentA,
        fileNameB: savedFileB.name,
        contentB,
        preferLegacyFormat: preferLegacyFormat()
      });

      props.onMergeResult(viewModel);
    } catch (error) {
      console.error(error);
      setHasMergeCallFailed(true);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <DropZone label={mergeSectionTitle} maximumFileCount={2} tooManyFilesMessage={tooManyFilesForTwoSavesMessage}
              onFilesDropped={handleSavesDropped}>
      <div class="inline-block">
        <h2>{mergeSectionTitle}</h2>
        <DropZone label={mergeSectionSaveAAreaLabel} maximumFileCount={1}
                  tooManyFilesMessage={tooManyFilesForOneSaveMessage}
                  onFilesDropped={(files) => selectFileInInput(saveAInput, files[0])}>
          <p><label>{mergeSectionSaveALabel}<input ref={saveAInput} type="file" accept="application/json"
                                                   onChange={(event) => setFileA(event.currentTarget.files?.[0] ?? null)}/></label>
          </p>
        </DropZone>
        <p>
          <button onClick={handleSwap} disabled={!fileA() && !fileB()}>
            <Icon content={mergeSectionSwapIcon}/> {mergeSectionSwapButtonLabel}
          </button>
        </p>
        <DropZone label={mergeSectionSaveBAreaLabel} maximumFileCount={1}
                  tooManyFilesMessage={tooManyFilesForOneSaveMessage}
                  onFilesDropped={(files) => selectFileInInput(saveBInput, files[0])}>
          <p><label>{mergeSectionSaveBLabel}<input ref={saveBInput} type="file" accept="application/json"
                                                   onChange={(event) => setFileB(event.currentTarget.files?.[0] ?? null)}/></label>
          </p>
        </DropZone>
        <p><label><input type="checkbox" checked={preferLegacyFormat()}
                         onChange={(event) => setPreferLegacyFormat(event.currentTarget.checked)}/>{mergeSectionPreferLegacyFormatLabel}</label>
        </p>
      </div>
      <button onClick={handleMerge} disabled={!fileA() || !fileB() || isMerging()}>{mergeButtonLabel}</button>
      <Show when={isMerging()}>
        <Spinner/>
      </Show>
      <Show when={hasMergeCallFailed()}>
        <p class="text-color-danger">{mergeSectionCallFailedMessage}</p>
      </Show>
    </DropZone>
  );
}
