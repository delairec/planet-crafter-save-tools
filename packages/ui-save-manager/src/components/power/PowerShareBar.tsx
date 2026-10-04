import {For} from 'solid-js';
import {PowerShareBarViewModel} from 'core-mapping/display/presentation/viewModels/PowerChartViewModel';
import PowerShareSegment from '~/components/power/PowerShareSegment';

interface PowerShareBarProps {
  bar: PowerShareBarViewModel;
  testId: string;
}

export default function PowerShareBar(props: PowerShareBarProps) {
  return (
    <section class="power-share-bar">
      <header class="power-share-header">
        <h5 class="power-share-title" data-testid={`${props.testId}-title`}>{props.bar.title}</h5>
        <span class="power-share-summary" data-testid={`${props.testId}-summary`}>{props.bar.summary}</span>
      </header>
      <div class="power-share-track">
        <For each={props.bar.segments}>
          {(segment, index) => <PowerShareSegment segment={segment} testId={`${props.testId}-segment-${index()}`}/>}
        </For>
      </div>
      <ul class="power-chart-legend">
        <For each={props.bar.segments}>
          {(segment, index) => (
            <li class="power-chart-legend-item" data-testid={`${props.testId}-legend-${index()}`}>
              <span class={`power-chart-swatch power-share-fill-${segment.fill}`} aria-hidden="true"/>
              {segment.label}
            </li>
          )}
        </For>
      </ul>
    </section>
  );
}
