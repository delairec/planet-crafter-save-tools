import {useContext} from 'solid-js';
import {LoadedSave, LoadedSaveContext} from "~/providers/LoadedSaveProvider.tsx";

export function useLoadedSave(): LoadedSave {
  const loadedSave = useContext(LoadedSaveContext);
  if (!loadedSave) {
    throw new Error('useLoadedSave is called outside of a LoadedSaveProvider.');
  }

  return loadedSave;
}
