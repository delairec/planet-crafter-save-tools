import {JSX} from 'solid-js';
import {PlayerGaugeKindViewModel, PlayerGaugeViewModel} from 'core-mapping/display/presentation/viewModels/PlayersPageViewModel';

const GAUGE_WIDTH = 48;
const GAUGE_HEIGHT = 50;
const FULL_GAUGE_PERCENTAGE = 100;

const drawGaugeShapeByKind: Record<PlayerGaugeKindViewModel, () => JSX.Element> = {
  oxygen: () => <>
    <rect x="13" y="9" width="22" height="39" rx="6"/>
    <rect x="19" y="2" width="10" height="9" rx="2"/>
  </>,
  health: () => <path d="M8 44 L40 44 Q44 44 44 40 L44 12 Q44 6 39 11 L8 42 Q5 44 8 44 Z"/>,
  thirst: () => <path d="M17 2 h14 v7 q9 5 9 15 v16 q0 8 -8 8 h-16 q-8 0 -8 -8 v-16 q0 -10 9 -15 z"/>
};

interface PlayerGaugeProps {
  gauge: PlayerGaugeViewModel;
  testId: string;
}

export default function PlayerGauge(props: PlayerGaugeProps) {
  const fillClipPathId = () => `${props.testId}-fill`;
  const filledHeight = () => GAUGE_HEIGHT * props.gauge.fillPercentage / FULL_GAUGE_PERCENTAGE;
  const drawGaugeShape = () => drawGaugeShapeByKind[props.gauge.kind]();

  return (
    <div class={`player-gauge player-gauge-${props.gauge.kind}`} data-testid={props.testId}>
      <svg class="player-gauge-shape" viewBox={`0 0 ${GAUGE_WIDTH} ${GAUGE_HEIGHT}`} width={GAUGE_WIDTH} height={GAUGE_HEIGHT}
           aria-hidden="true">
        <defs>
          <clipPath id={fillClipPathId()}>
            <rect x="0" y={GAUGE_HEIGHT - filledHeight()} width={GAUGE_WIDTH} height={filledHeight()}/>
          </clipPath>
        </defs>
        <g class="player-gauge-empty">{drawGaugeShape()}</g>
        <g class="player-gauge-filled" clip-path={`url(#${fillClipPathId()})`}>{drawGaugeShape()}</g>
        <g class="player-gauge-outline">{drawGaugeShape()}</g>
      </svg>
      <div class="player-gauge-readings">
        <span class="player-gauge-label">
          <span data-testid={`${props.testId}-label`}>{props.gauge.label}</span>
          {' · '}
          <span data-testid={`${props.testId}-percentage`}>{props.gauge.percentageLabel}</span>
        </span>
        <span class="player-gauge-amount" data-testid={`${props.testId}-amount`}>{props.gauge.amount}</span>
      </div>
    </div>
  );
}
