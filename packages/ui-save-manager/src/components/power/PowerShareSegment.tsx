import {createUniqueId, Show} from 'solid-js';
import {PowerShareSegmentViewModel} from 'core-mapping/display/presentation/viewModels/PowerChartViewModel';

interface PowerShareSegmentProps {
  segment: PowerShareSegmentViewModel;
  testId: string;
}

export default function PowerShareSegment(props: PowerShareSegmentProps) {
  const tooltipId = createUniqueId();
  return (
    <span class="tooltip-anchor power-share-anchor" style={{width: `${props.segment.widthPercentage}%`}}>
      <span class={`power-share-segment power-share-fill-${props.segment.fill}`} tabindex="0" role="img" aria-label={props.segment.label}
            aria-describedby={tooltipId} data-testid={props.testId}>
        <Show when={props.segment.writtenShare}>
          {(writtenShare) => (
            <span class="power-share-written-share" aria-hidden="true" data-testid={`${props.testId}-share`}>{writtenShare()}</span>
          )}
        </Show>
      </span>
      <span id={tooltipId} role="tooltip" class="tooltip" data-testid={`${props.testId}-description`}>
        <strong>{props.segment.label}</strong> {props.segment.detail}
      </span>
    </span>
  );
}
