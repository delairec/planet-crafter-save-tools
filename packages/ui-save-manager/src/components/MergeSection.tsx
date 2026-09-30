import {createSignal, Show} from 'solid-js';
import {mergeSaveFilesController} from 'core-mapping/composition/compositionRoot';
import {MergeResultViewModel} from 'core-mapping/presentation/viewModels/MergeResultViewModel';
import Spinner from '~/components/structure/Spinner';
import DropZone from '~/components/structure/DropZone';
import CheckboxField from '~/components/structure/CheckboxField';
import IconButton from '~/components/structure/IconButton';
import SaveFileField from '~/components/structure/SaveFileField';
import Notification from '~/components/structure/Notification';
import {yieldToPaint} from '~/lib/yieldToPaint';
import {selectFileInInput} from '~/lib/selectFileInInput';
import {orderDroppedSaves} from '~/lib/orderDroppedSaves';
import {
  mergeButtonLabel,
  mergeSectionCallFailedMessage,
  mergeSectionPreferLegacyFormatDescription,
  mergeSectionPreferLegacyFormatLabel,
  mergeSectionSaveAAreaLabel,
  mergeSectionSaveALabel,
  mergeSectionSaveAPrecedenceNotice,
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
      const viewModel = await mergeSaveFilesController.mergeSaveFiles({
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
    <DropZone label={mergeSectionTitle} testId="merge-area" maximumFileCount={2} tooManyFilesMessage={tooManyFilesForTwoSavesMessage}
              onFilesDropped={handleSavesDropped}>
      <div class="inline-block">
        <h2 data-testid="merge-title">{mergeSectionTitle}</h2>
        <Notification severity="information" testId="merge-precedence-notice">{mergeSectionSaveAPrecedenceNotice}</Notification>
        <div class="merge-slots">
          <IconButton class="merge-slots-swap" icon={mergeSectionSwapIcon} label={mergeSectionSwapButtonLabel} testId="swap-saves"
                      onClick={handleSwap} disabled={!fileA() && !fileB()}/>
          <DropZone label={mergeSectionSaveAAreaLabel} testId="save-a-area" maximumFileCount={1}
                    tooManyFilesMessage={tooManyFilesForOneSaveMessage}
                    onFilesDropped={(files) => selectFileInInput(saveAInput, files[0])}>
            <p><SaveFileField label={mergeSectionSaveALabel} testId="save-a" ref={saveAInput}
                              onChange={(event) => setFileA(event.currentTarget.files?.[0] ?? null)}/></p>
          </DropZone>
          <DropZone label={mergeSectionSaveBAreaLabel} testId="save-b-area" maximumFileCount={1}
                    tooManyFilesMessage={tooManyFilesForOneSaveMessage}
                    onFilesDropped={(files) => selectFileInInput(saveBInput, files[0])}>
            <p><SaveFileField label={mergeSectionSaveBLabel} testId="save-b" ref={saveBInput}
                              onChange={(event) => setFileB(event.currentTarget.files?.[0] ?? null)}/></p>
          </DropZone>
        </div>
        <p class="merge-option">
          <CheckboxField label={mergeSectionPreferLegacyFormatLabel}
                         description={mergeSectionPreferLegacyFormatDescription}
                         testId="prefer-legacy-format"
                         checked={preferLegacyFormat()} onChange={setPreferLegacyFormat}/>
        </p>
      </div>
      <button data-testid="merge" onClick={handleMerge} disabled={!fileA() || !fileB() || isMerging()}>{mergeButtonLabel}</button>
      <Show when={isMerging()}>
        <Spinner testId="merge-busy-indicator"/>
      </Show>
      <Show when={hasMergeCallFailed()}>
        <p class="text-color-danger">{mergeSectionCallFailedMessage}</p>
      </Show>
    </DropZone>
  );
}
