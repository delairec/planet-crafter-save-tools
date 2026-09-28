import {useContext} from 'solid-js';
import {MergedSaves, MergedSavesContext} from "~/providers/MergedSavesProvider.tsx";

export function useMergedSaves(): MergedSaves {
  const mergedSaves = useContext(MergedSavesContext);
  if (!mergedSaves) {
    throw new Error('useMergedSaves is called outside of a MergedSavesProvider.');
  }

  return mergedSaves;
}
