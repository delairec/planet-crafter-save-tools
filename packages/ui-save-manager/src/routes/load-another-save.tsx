import {useNavigate} from '@solidjs/router';
import Breadcrumb from '~/components/shell/Breadcrumb';
import LoadSaveSection from '~/components/LoadSaveSection';
import {PAGE_PATHS} from '~/lib/pagePaths';
import {loadAnotherSavePageTitle, toolsGroupTitle} from '~/messages/shellMessages';

export default function LoadAnotherSavePage() {
  const navigate = useNavigate();

  return (
    <>
      <Breadcrumb group={toolsGroupTitle} page={loadAnotherSavePageTitle}/>
      <LoadSaveSection onSaveLoaded={() => navigate(PAGE_PATHS.overviewPath)}/>
    </>
  );
}
