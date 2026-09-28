import {For, Show} from 'solid-js';
import {PlayersMenuViewModel} from 'core-mapping/presentation/viewModels/PlayersMenuViewModel';
import HostBadge from '~/components/players/HostBadge';
import Surface from '~/components/structure/Surface';

interface PlayersMenuProps {
  playersMenu: PlayersMenuViewModel;
}

export default function PlayersMenu(props: PlayersMenuProps) {
  return (
    <ul class="menu-players">
      <For each={props.playersMenu.players}>
        {(player) => (
          <li data-testid="menu-player">
            <Surface>
              <div class="menu-player">
                <span class="menu-player-name">{player.name}</span>
                <Show when={player.hostBadge}>
                  {(hostBadge) => <HostBadge label={hostBadge()}/>}
                </Show>
                <Show when={player.planet}>
                  {(planet) => <span class="menu-player-planet">{planet()}</span>}
                </Show>
              </div>
            </Surface>
          </li>
        )}
      </For>
    </ul>
  );
}
