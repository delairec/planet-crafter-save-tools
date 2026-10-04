import {For, Show} from "solid-js";
import SavePage from '~/components/shell/SavePage';
import SectionTitle from '~/components/structure/SectionTitle';
import SectionState from '~/components/structure/SectionState';
import PlayerCard from '~/components/players/PlayerCard';
import EquipmentIconSprite from '~/components/players/EquipmentIconSprite';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {playersGroupTitle, playersPageTitle} from '~/messages/shellMessages';
import {playersSectionTitle} from '~/messages/playersSectionMessages';

export default function PlayersPage() {
  const loadedSave = useLoadedSave();

  return (
    <SavePage group={playersGroupTitle} page={playersPageTitle}>
      <SectionTitle testId="players-title">{playersSectionTitle}</SectionTitle>
      <SectionState title={playersSectionTitle} resource={loadedSave.viewModels.playersPage}>
        {(playersPage) => (<>
          <Show when={playersPage().playerCountHint}>
            {(playerCountHint) => <p class="players-count" data-testid="players-count">{playerCountHint()}</p>}
          </Show>
          <EquipmentIconSprite/>
          <div class="player-cards">
            <For each={playersPage().players}>
              {(player, index) => <PlayerCard player={player} index={index()}/>}
            </For>
          </div>
        </>)}
      </SectionState>
    </SavePage>
  );
}
