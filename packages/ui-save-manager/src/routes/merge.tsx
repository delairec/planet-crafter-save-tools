import {createSignal} from 'solid-js';
import {MergeResultViewModel} from 'core-mapping/presentation/viewModels/MergeResultViewModel';
import Breadcrumb from '~/components/shell/Breadcrumb';
import MergeSection from '~/components/MergeSection';
import MergeResultSection from '~/components/MergeResultSection';
import {mergeTwoSavesPageTitle, toolsGroupTitle} from '~/messages/shellMessages';

export default function MergePage() {
  const [mergeResult, setMergeResult] = createSignal<MergeResultViewModel | null>(null);

  return (
    <>
      <Breadcrumb group={toolsGroupTitle} page={mergeTwoSavesPageTitle}/>
      <MergeSection onMergeStarted={() => setMergeResult(null)} onMergeResult={setMergeResult}/>
      <MergeResultSection result={mergeResult}/>
    </>
  );
}
