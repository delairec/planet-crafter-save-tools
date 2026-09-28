import {Accessor, createContext, createSignal, JSX, onCleanup} from "solid-js";
import {MergeResultViewModel} from "core-mapping/presentation/viewModels/MergeResultViewModel";

const KEPT_MERGED_SAVES_LIMIT = 5;

export interface KeptMergedSave {
  fileName: string;
  downloadUrl: string;
}

export interface MergedSaves {
  lastMergeResult: Accessor<MergeResultViewModel | null>;
  lastMergedSave: Accessor<KeptMergedSave | null>;
  earlierMergedSaves: Accessor<KeptMergedSave[]>;
  startMerge: () => void;
  keepMergeResult: (result: MergeResultViewModel) => void;
}

export const MergedSavesContext = createContext<MergedSaves>();

interface MergedSavesProviderProps {
  children: JSX.Element;
}

function keepMergedSave(result: MergeResultViewModel): KeptMergedSave {
  return {
    fileName: result.fileName,
    downloadUrl: URL.createObjectURL(new Blob([result.content], {type: 'application/json'}))
  };
}

function releaseMergedSaves(mergedSaves: KeptMergedSave[]): void {
  for (const mergedSave of mergedSaves) {
    URL.revokeObjectURL(mergedSave.downloadUrl);
  }
}

export function MergedSavesProvider(props: MergedSavesProviderProps) {
  const [lastMergeResult, setLastMergeResult] = createSignal<MergeResultViewModel | null>(null);
  const [keptMergedSaves, setKeptMergedSaves] = createSignal<KeptMergedSave[]>([]);
  const lastMergedSave = () => lastMergeResult()?.status === 'success' ? keptMergedSaves()[0] ?? null : null;

  const keepMergeResult = (result: MergeResultViewModel) => {
    if (result.status === 'success') {
      const mergedSaves = [keepMergedSave(result), ...keptMergedSaves()];
      releaseMergedSaves(mergedSaves.slice(KEPT_MERGED_SAVES_LIMIT));
      setKeptMergedSaves(mergedSaves.slice(0, KEPT_MERGED_SAVES_LIMIT));
    }
    setLastMergeResult(result);
  };

  onCleanup(() => releaseMergedSaves(keptMergedSaves()));

  const mergedSaves: MergedSaves = {
    lastMergeResult,
    lastMergedSave,
    earlierMergedSaves: () => lastMergedSave() ? keptMergedSaves().slice(1) : keptMergedSaves(),
    startMerge: () => setLastMergeResult(null),
    keepMergeResult
  };

  return <MergedSavesContext.Provider value={mergedSaves}>{props.children}</MergedSavesContext.Provider>;
}
