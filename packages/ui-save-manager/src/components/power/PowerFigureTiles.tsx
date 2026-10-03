import {Show} from 'solid-js';
import {PlanetPowerZoneViewModel, PowerFigureTileViewModel} from 'core-mapping/display/presentation/viewModels/PlanetPowerZoneViewModel';
import ToneBadge from '~/components/structure/ToneBadge';

interface PowerFigureTileProps {
  tile: PowerFigureTileViewModel;
  testId: string;
}

function PowerFigureTile(props: PowerFigureTileProps) {
  return (
    <div class="power-tile" data-testid={props.testId}>
      <dt>{props.tile.label}</dt>
      <dd class="power-tile-value" data-testid={`${props.testId}-value`}>{props.tile.value}</dd>
    </div>
  );
}

interface PowerFigureTilesProps {
  zone: PlanetPowerZoneViewModel;
}

export default function PowerFigureTiles(props: PowerFigureTilesProps) {
  return (
    <dl class="power-tiles">
      <PowerFigureTile tile={props.zone.production} testId="power-production"/>
      <PowerFigureTile tile={props.zone.consumption} testId="power-consumption"/>
      <div class="power-tile" data-testid="power-available">
        <dt>{props.zone.available.label}</dt>
        <dd class="power-tile-value">
          <span data-testid="power-available-value">{props.zone.available.value}</span>
          <ToneBadge badge={props.zone.balance} testId="power-available-balance"/>
        </dd>
        <Show when={props.zone.loadMeter}>
          {(loadMeter) => (
            <dd class="power-load-meter" data-testid="power-load-meter">
              <span class="power-load-meter-track" aria-hidden="true">
                <span class="power-load-meter-fill" style={{width: `${loadMeter().fillPercentage}%`}} data-testid="power-load-meter-fill"/>
              </span>
              <span class="power-load-meter-label" data-testid="power-load-meter-label">{loadMeter().label}</span>
            </dd>
          )}
        </Show>
      </div>
    </dl>
  );
}
