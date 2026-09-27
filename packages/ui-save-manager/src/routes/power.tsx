import SavePage from '~/components/shell/SavePage';
import EnergyLevelsSection from '~/components/EnergyLevelsSection';
import {useLoadedSave} from '~/hooks/useLoadedSave.tsx';
import {powerPageTitle, saveGroupTitle} from '~/messages/shellMessages';

export default function PowerPage() {
  const loadedSave = useLoadedSave();

  return (
    <SavePage group={saveGroupTitle} page={powerPageTitle}>
      <EnergyLevelsSection viewModel={loadedSave.viewModels.energyLevels}/>
    </SavePage>
  );
}
