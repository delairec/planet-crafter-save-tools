import {Accessor, createSignal, JSX} from 'solid-js';
import {LoadAndValidateSaveFileController} from "core-mapping/controllers/LoadAndValidateSaveFileController";
import {MergeResultViewModel} from "core-mapping/presentation/viewModels/MergeResultViewModel";
import {SaveValidationMessageViewModel} from "core-mapping/presentation/viewModels/SaveFileValidationViewModel";
import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {yieldToPaint} from "./yieldToPaint";

export interface LoadSaveFile {
  file: Accessor<File | null>;
  sections: Accessor<ParsedSections | null>;
  errors: Accessor<SaveValidationMessageViewModel[]>;
  warnings: Accessor<SaveValidationMessageViewModel[]>;
  mergeResult: Accessor<MergeResultViewModel | null>;
  isLoading: Accessor<boolean>;
  hasLoadCallFailed: Accessor<boolean>;
  handleFileChange: JSX.EventHandler<HTMLInputElement, Event>;
  handleSubmit: () => Promise<void>;
  handleMergeStarted: () => void;
  handleSubmitMerge: (result: MergeResultViewModel) => void;
}

export function useLoadSaveFile(): LoadSaveFile {
  const [file, setFile] = createSignal<File | null>(null);
  const [sections, setSections] = createSignal<ParsedSections | null>(null);
  const [errors, setErrors] = createSignal<SaveValidationMessageViewModel[]>([]);
  const [warnings, setWarnings] = createSignal<SaveValidationMessageViewModel[]>([]);
  const [mergeResult, setMergeResult] = createSignal<MergeResultViewModel | null>(null);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [hasLoadCallFailed, setHasLoadCallFailed] = createSignal<boolean>(false);

  const resetDisplayFields = () => {
    setErrors([]);
    setWarnings([]);
    setSections(null);
    setMergeResult(null);
    setHasLoadCallFailed(false);
  };

  const handleFileChange: JSX.EventHandler<HTMLInputElement, Event> = (event) => {
    resetDisplayFields();
    setFile(event.currentTarget.files?.[0] ?? null);
  };

  const handleSubmit = async () => {
    resetDisplayFields();
    const selectedFile = file();

    if (!selectedFile) {
      return;
    }

    setIsLoading(true);
    try {
      await yieldToPaint();

      const content = await selectedFile.text();
      const viewModel = await LoadAndValidateSaveFileController.loadAndValidateSaveFile(selectedFile.name, content);

      setSections(viewModel.sections);
      setErrors(viewModel.errors);
      setWarnings(viewModel.warnings);
    } catch (error) {
      console.error(error);
      setHasLoadCallFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitMerge = (result: MergeResultViewModel) => {
    resetDisplayFields();
    setFile(null);
    setMergeResult(result);
  };

  return {
    file,
    sections,
    errors,
    warnings,
    mergeResult,
    isLoading,
    hasLoadCallFailed,
    handleFileChange,
    handleSubmit,
    handleMergeStarted: resetDisplayFields,
    handleSubmitMerge
  };
}
