import {Show} from 'solid-js';
import {OverviewPlanetPowerViewModel, OverviewPowerBarViewModel} from 'core-mapping/display/presentation/viewModels/OverviewPageViewModel';

type OverviewPowerSeries = 'production' | 'consumption';

interface OverviewPlanetBarRowProps {
  bar: OverviewPowerBarViewModel;
  series: OverviewPowerSeries;
  testId: string;
}

function OverviewPlanetBarRow(props: OverviewPlanetBarRowProps) {
  return (
    <div class="overview-planet-power-row">
      <dt>{props.bar.label}</dt>
      <dd class="overview-planet-bar" aria-hidden="true">
        <span class={`overview-planet-bar-${props.series}`} style={{width: `${props.bar.widthPercentage}%`}} data-testid={`${props.testId}-${props.series}-bar`}/>
      </dd>
      <dd class="overview-planet-power-value" data-testid={`${props.testId}-${props.series}`}>{props.bar.value}</dd>
    </div>
  );
}

interface OverviewPlanetPowerProps {
  power: OverviewPlanetPowerViewModel;
  testId: string;
}

export default function OverviewPlanetPower(props: OverviewPlanetPowerProps) {
  return (
    <dl class="overview-planet-foot overview-planet-power">
      <OverviewPlanetBarRow bar={props.power.production} series="production" testId={props.testId}/>
      <OverviewPlanetBarRow bar={props.power.consumption} series="consumption" testId={props.testId}/>
      <div class="overview-planet-power-row">
        <dt>{props.power.available.label}</dt>
        <dd class="overview-planet-share">
          <Show when={props.power.shareOfProductionConsumed}>
            {(share) => <span data-testid={`${props.testId}-share`}>{share()}</span>}
          </Show>
        </dd>
        <dd class="overview-planet-power-value" data-testid={`${props.testId}-available`}>{props.power.available.value}</dd>
      </div>
    </dl>
  );
}
