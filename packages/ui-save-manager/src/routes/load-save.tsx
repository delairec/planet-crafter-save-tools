import {createSignal} from 'solid-js';
import {useNavigate} from '@solidjs/router';
import Breadcrumb from '~/components/shell/Breadcrumb';
import LoadSaveSection, {type LoadSaveResult} from '~/components/LoadSaveSection';
import LoadSaveResultSection from '~/components/LoadSaveResultSection';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {PAGE_PATHS} from '~/lib/pagePaths';
import {resolveLoadSavePageTitle, toolsGroupTitle} from '~/messages/shellMessages';

export default function LoadSavePage() {
  const navigate = useNavigate();
  const loadedSave = useLoadedSave();
  const [loadResult, setLoadResult] = createSignal<LoadSaveResult | null>(null);

  const handleLoadResult = (result: LoadSaveResult) => {
    if (!result.isValid) {
      setLoadResult(result);
      return;
    }

    loadedSave.loadSave({content: result.content, fileName: result.fileName, warnings: result.warnings});
    navigate(PAGE_PATHS.overviewPath);
  };

  return (
    <>
      <Breadcrumb group={toolsGroupTitle} page={resolveLoadSavePageTitle(loadedSave.isSaveLoaded())}/>
      <LoadSaveSection onLoadStarted={() => setLoadResult(null)} onLoadResult={handleLoadResult}/>
      <LoadSaveResultSection result={loadResult}/>
    </>
  );
}
