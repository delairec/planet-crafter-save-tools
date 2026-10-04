import {createUniqueId} from 'solid-js';
import {PowerChartBarViewModel} from 'core-mapping/display/presentation/viewModels/PowerChartViewModel';

interface PowerChartBarProps {
  bar: PowerChartBarViewModel;
  testId: string;
}

export default function PowerChartBar(props: PowerChartBarProps) {
  const labelId = createUniqueId();
  const valueId = createUniqueId();
  const tooltipId = createUniqueId();
  return (
    <div class="power-chart-row">
      <span id={labelId} class="power-chart-label" data-testid={`${props.testId}-label`}>{props.bar.label}</span>
      <span class="tooltip-anchor power-chart-anchor">
        <span class="power-chart-track" tabindex="0" role="img" aria-labelledby={`${labelId} ${valueId}`} aria-describedby={tooltipId}
              data-testid={props.testId}>
          <span class={`power-chart-fill power-chart-fill-${props.bar.series}`} style={{width: `${props.bar.widthPercentage}%`}}/>
        </span>
        <span id={tooltipId} role="tooltip" class="tooltip" data-testid={`${props.testId}-description`}>
          <strong>{props.bar.label}</strong> {props.bar.detail}
        </span>
      </span>
      <span id={valueId} class="power-chart-value" data-testid={`${props.testId}-value`}>{props.bar.value}</span>
    </div>
  );
}
