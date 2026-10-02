import {For, Show} from 'solid-js';
import FieldsGroup from '~/components/structure/FieldsGroup';
import HostBadge from '~/components/players/HostBadge';
import PlayerGauge from '~/components/players/PlayerGauge';
import {PlayerCardViewModel} from 'core-mapping/display/presentation/viewModels/PlayersPageViewModel';

interface PlayerCardProps {
  player: PlayerCardViewModel;
  index: number;
}

export default function PlayerCard(props: PlayerCardProps) {
  return (
    <div class="card player-card" data-testid={`player-card-${props.index}`}>
      <div class="card-header player-card-header">
        <h4 data-testid={`player-name-${props.index}`}>{props.player.name}</h4>
        <Show when={props.player.hostBadge}>
          {(hostBadge) => <HostBadge label={hostBadge()}/>}
        </Show>
        <Show when={props.player.planetLabel}>
          {(planetLabel) => <span class="card-summary" data-testid={`player-planet-${props.index}`}>{planetLabel()}</span>}
        </Show>
      </div>
      <div class="card-body">
        <div class="player-gauges">
          <For each={props.player.gauges}>
            {(gauge) => <PlayerGauge gauge={gauge} testId={`player-${props.index}-gauge-${gauge.kind}`}/>}
          </For>
        </div>
        <div class="fields-group-container">
          <FieldsGroup columns={() => props.player.columns}/>
        </div>
      </div>
    </div>
  );
}
