import SavePage from '~/components/shell/SavePage';
import TerraformationLevelsSection from '~/components/TerraformationLevelsSection';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {saveGroupTitle, terraformationPageTitle} from '~/messages/shellMessages';

export default function TerraformationPage() {
  const loadedSave = useLoadedSave();

  return (
    <SavePage group={saveGroupTitle} page={terraformationPageTitle}>
      <TerraformationLevelsSection viewModel={loadedSave.viewModels.terraformationLevels}/>
    </SavePage>
  );
}
