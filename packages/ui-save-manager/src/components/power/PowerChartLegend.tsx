import {For} from 'solid-js';
import {PowerChartLegendItemViewModel} from 'core-mapping/display/presentation/viewModels/PowerChartViewModel';

interface PowerChartLegendProps {
  legend: PowerChartLegendItemViewModel[];
}

export default function PowerChartLegend(props: PowerChartLegendProps) {
  return (
    <ul class="power-chart-legend">
      <For each={props.legend}>
        {(item, index) => (
          <li class="power-chart-legend-item" data-testid={`power-chart-legend-${index()}`}>
            <span class={`power-chart-swatch power-chart-swatch-${item.series}`} aria-hidden="true"/>
            {item.label}
          </li>
        )}
      </For>
    </ul>
  );
}
