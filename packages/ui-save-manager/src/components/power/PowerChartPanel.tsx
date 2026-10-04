import {For, Show} from 'solid-js';
import {PowerChartPanelViewModel} from 'core-mapping/display/presentation/viewModels/PowerChartViewModel';
import PowerChartBar from '~/components/power/PowerChartBar';

interface PowerChartPanelProps {
  panel: PowerChartPanelViewModel;
  testId: string;
}

export default function PowerChartPanel(props: PowerChartPanelProps) {
  return (
    <section class="power-chart-panel">
      <header class="power-chart-panel-header">
        <h5 class="power-chart-title" data-testid={`${props.testId}-title`}>{props.panel.title}</h5>
        <span class="power-chart-summary" data-testid={`${props.testId}-summary`}>{props.panel.summary}</span>
      </header>
      <div class="power-chart-rows">
        <For each={props.panel.bars}>
          {(bar, index) => <PowerChartBar bar={bar} testId={`${props.testId}-bar-${index()}`}/>}
        </For>
        <Show when={props.panel.ticks.length > 0}>
          <div class="power-chart-ticks" aria-hidden="true">
            <For each={props.panel.ticks}>
              {(tick, index) => <span class="power-chart-tick" data-testid={`${props.testId}-tick-${index()}`}>{tick}</span>}
            </For>
          </div>
        </Show>
      </div>
    </section>
  );
}
