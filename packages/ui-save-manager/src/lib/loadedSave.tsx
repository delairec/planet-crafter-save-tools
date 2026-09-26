import {Accessor, createContext, JSX, useContext} from 'solid-js';
import {LoadSaveFile, useLoadSaveFile} from './useLoadSaveFile';
import {SectionViewModels, useSectionViewModels} from './useSectionViewModels';

export interface LoadedSave extends LoadSaveFile {
  isSaveLoaded: Accessor<boolean>;
  viewModels: SectionViewModels;
}

const LoadedSaveContext = createContext<LoadedSave>();

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

export function useLoadedSave(): LoadedSave {
  const loadedSave = useContext(LoadedSaveContext);
  if (!loadedSave) {
    throw new Error('useLoadedSave is called outside of a LoadedSaveProvider.');
  }

  return loadedSave;
}
