import {Accessor, createSignal, JSX} from 'solid-js';
import {LoadAndValidateSaveFileController} from "core-mapping/controllers/LoadAndValidateSaveFileController";
import {SaveValidationMessageViewModel} from "core-mapping/presentation/viewModels/SaveFileValidationViewModel";
import {yieldToPaint} from "../lib/yieldToPaint.ts";

export interface ValidatedSave {
  content: string;
  fileName: string;
}

export interface LoadSaveFile {
  file: Accessor<File | null>;
  validatedSave: Accessor<ValidatedSave | null>;
  validatedContent: Accessor<string | null>;
  errors: Accessor<SaveValidationMessageViewModel[]>;
  warnings: Accessor<SaveValidationMessageViewModel[]>;
  isLoading: Accessor<boolean>;
  hasLoadCallFailed: Accessor<boolean>;
  handleFileChange: JSX.EventHandler<HTMLInputElement, Event>;
  handleSubmit: () => Promise<void>;
}

export function useLoadSaveFile(): LoadSaveFile {
  const [file, setFile] = createSignal<File | null>(null);
  const [validatedSave, setValidatedSave] = createSignal<ValidatedSave | null>(null);
  const [errors, setErrors] = createSignal<SaveValidationMessageViewModel[]>([]);
  const [warnings, setWarnings] = createSignal<SaveValidationMessageViewModel[]>([]);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [hasLoadCallFailed, setHasLoadCallFailed] = createSignal<boolean>(false);

  const resetDisplayFields = () => {
    setErrors([]);
    setWarnings([]);
    setValidatedSave(null);
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

      setValidatedSave(viewModel.status === 'valid' ? {content, fileName: selectedFile.name} : null);
      setErrors(viewModel.errors);
      setWarnings(viewModel.warnings);
    } catch (error) {
      console.error(error);
      setHasLoadCallFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    file,
    validatedSave,
    validatedContent: () => validatedSave()?.content ?? null,
    errors,
    warnings,
    isLoading,
    hasLoadCallFailed,
    handleFileChange,
    handleSubmit
  };
}
