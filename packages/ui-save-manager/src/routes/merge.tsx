import Breadcrumb from '~/components/shell/Breadcrumb';
import MergeSection from '~/components/MergeSection';
import MergeResultSection from '~/components/MergeResultSection';
import EarlierMergedSavesSection from '~/components/EarlierMergedSavesSection';
import {useMergedSaves} from '~/hooks/useMergedSaves';
import {mergeTwoSavesPageTitle, toolsGroupTitle} from '~/messages/shellMessages';

export default function MergePage() {
  const mergedSaves = useMergedSaves();

  return (
    <>
      <Breadcrumb group={toolsGroupTitle} page={mergeTwoSavesPageTitle}/>
      <MergeSection onMergeStarted={mergedSaves.startMerge} onMergeResult={mergedSaves.keepMergeResult}/>
      <MergeResultSection result={mergedSaves.lastMergeResult} mergedSave={mergedSaves.lastMergedSave}/>
      <EarlierMergedSavesSection mergedSaves={mergedSaves.earlierMergedSaves}/>
    </>
  );
}
