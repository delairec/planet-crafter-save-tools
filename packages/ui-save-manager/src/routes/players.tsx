import SavePage from '~/components/shell/SavePage';
import PlayersSection from '~/components/PlayersSection';
import {useLoadedSave} from '~/hooks/useLoadedSave.tsx';
import {playersGroupTitle, playersPageTitle} from '~/messages/shellMessages';

export default function PlayersPage() {
  const loadedSave = useLoadedSave();

  return (
    <SavePage group={playersGroupTitle} page={playersPageTitle}>
      <PlayersSection viewModel={loadedSave.viewModels.players}/>
    </SavePage>
  );
}
