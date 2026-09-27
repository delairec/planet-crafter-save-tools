import {Accessor, createContext, JSX} from "solid-js";
import {LoadSaveFile, useLoadSaveFile} from "~/lib/useLoadSaveFile.ts";
import {SectionViewModels, useSectionViewModels} from "~/lib/useSectionViewModels.ts";

export interface LoadedSave extends LoadSaveFile {
  isSaveLoaded: Accessor<boolean>;
  viewModels: SectionViewModels;
}

export const LoadedSaveContext = createContext<LoadedSave>();

interface LoadedSaveProviderProps {
  children: JSX.Element;
}

export function LoadedSaveProvider(props: LoadedSaveProviderProps) {
  const loadSaveFile = useLoadSaveFile();
  const loadedSave: LoadedSave = {
    ...loadSaveFile,
    isSaveLoaded: () => loadSaveFile.validatedContent() !== null,
    viewModels: useSectionViewModels(loadSaveFile.validatedContent)
  };

  return <LoadedSaveContext.Provider value={loadedSave}>{props.children}</LoadedSaveContext.Provider>;
}