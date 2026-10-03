import {Show} from 'solid-js';
import {OverviewFigureTileViewModel, OverviewTilesViewModel} from 'core-mapping/display/presentation/viewModels/OverviewPageViewModel';
import ToneBadge from '~/components/structure/ToneBadge';

interface OverviewFigureTileProps {
  tile: OverviewFigureTileViewModel;
  testId: string;
}

function OverviewFigureTile(props: OverviewFigureTileProps) {
  return (
    <div class="overview-tile" data-testid={props.testId}>
      <dt>{props.tile.label}</dt>
      <dd class="overview-tile-value" data-testid={`${props.testId}-value`}>
        {props.tile.value}
        <Show when={props.tile.unit}>
          {(unit) => <small class="overview-tile-unit">{unit()}</small>}
        </Show>
      </dd>
      <Show when={props.tile.caption}>
        {(caption) => <dd class="overview-tile-caption" data-testid={`${props.testId}-caption`}>{caption()}</dd>}
      </Show>
    </div>
  );
}

interface OverviewTilesProps {
  tiles: OverviewTilesViewModel;
}

export default function OverviewTiles(props: OverviewTilesProps) {
  return (
    <dl class="overview-tiles" data-testid="overview-tiles">
      <Show when={props.tiles.systemTerraformationIndex}>
        {(tile) => <OverviewFigureTile tile={tile()} testId="overview-system-terraformation-index"/>}
      </Show>
      <Show when={props.tiles.allTimeTerraTokens}>
        {(tile) => <OverviewFigureTile tile={tile()} testId="overview-all-time-terra-tokens"/>}
      </Show>
      <Show when={props.tiles.totalCraftedObjects}>
        {(tile) => <OverviewFigureTile tile={tile()} testId="overview-total-crafted-objects"/>}
      </Show>
      <Show when={props.tiles.droneLogistics}>
        {(tile) => (
          <div class="overview-tile" data-testid="overview-drone-logistics">
            <dt>{tile().label}</dt>
            <dd class="overview-tile-value"><ToneBadge badge={tile().badge} testId="overview-drone-logistics-badge"/></dd>
          </div>
        )}
      </Show>
    </dl>
  );
}
