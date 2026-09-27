import SavePage from '~/components/shell/SavePage';
import SaveConfigurationSection from '~/components/SaveConfigurationSection';
import GlobalProgressionSection from '~/components/GlobalProgressionSection';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {configurationPageTitle, saveGroupTitle} from '~/messages/shellMessages';

export default function ConfigurationPage() {
  const loadedSave = useLoadedSave();

  return (
    <SavePage group={saveGroupTitle} page={configurationPageTitle}>
      <div class="grid-container">
        <SaveConfigurationSection viewModel={loadedSave.viewModels.saveConfiguration}/>
        <GlobalProgressionSection viewModel={loadedSave.viewModels.globalProgression}/>
      </div>
    </SavePage>
  );
}
