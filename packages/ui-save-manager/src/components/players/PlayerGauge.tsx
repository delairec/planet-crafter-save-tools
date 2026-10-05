import {JSX} from 'solid-js';
import {PlayerGaugeKindViewModel, PlayerGaugeViewModel} from 'core-mapping/display/presentation/viewModels/PlayersPageViewModel';

const GAUGE_WIDTH = 48;
const GAUGE_HEIGHT = 50;
const FULL_GAUGE_PERCENTAGE = 100;

interface GaugeShape {
  draw: () => JSX.Element;
  top: number;
  bottom: number;
  resolveFilledHeightShare: (fillShare: number) => number;
}

const resolveFilledHeightShareOfAColumn = (fillShare: number): number => fillShare;
const resolveFilledHeightShareOfATriangleStandingOnItsBase = (fillShare: number): number => 1 - Math.sqrt(1 - fillShare);

const gaugeShapeByKind: Record<PlayerGaugeKindViewModel, GaugeShape> = {
  oxygen: {
    draw: () => <>
      <rect x="13" y="9" width="22" height="39" rx="6"/>
      <rect x="19" y="2" width="10" height="9" rx="2"/>
    </>,
    top: 2,
    bottom: 48,
    resolveFilledHeightShare: resolveFilledHeightShareOfAColumn
  },
  health: {
    draw: () => <path d="M8 44 L40 44 Q44 44 44 40 L44 12 Q44 6 39 11 L8 42 Q5 44 8 44 Z"/>,
    top: 6,
    bottom: 44,
    resolveFilledHeightShare: resolveFilledHeightShareOfATriangleStandingOnItsBase
  },
  thirst: {
    draw: () => <path d="M17 2 h14 v7 q9 5 9 15 v16 q0 8 -8 8 h-16 q-8 0 -8 -8 v-16 q0 -10 9 -15 z"/>,
    top: 2,
    bottom: 48,
    resolveFilledHeightShare: resolveFilledHeightShareOfAColumn
  }
};

interface PlayerGaugeProps {
  gauge: PlayerGaugeViewModel;
  testId: string;
}

export default function PlayerGauge(props: PlayerGaugeProps) {
  const fillClipPathId = () => `${props.testId}-fill`;
  const gaugeShape = () => gaugeShapeByKind[props.gauge.kind];
  const filledHeight = () => {
    const shape = gaugeShape();
    const fillShare = Math.min(Math.max(props.gauge.fillPercentage / FULL_GAUGE_PERCENTAGE, 0), 1);
    return (shape.bottom - shape.top) * shape.resolveFilledHeightShare(fillShare);
  };
  const drawGaugeShape = () => gaugeShape().draw();

  return (
    <div class={`player-gauge player-gauge-${props.gauge.kind}`} data-testid={props.testId}>
      <svg class="player-gauge-shape" viewBox={`0 0 ${GAUGE_WIDTH} ${GAUGE_HEIGHT}`} aria-hidden="true">
        <defs>
          <clipPath id={fillClipPathId()}>
            <rect x="0" y={gaugeShape().bottom - filledHeight()} width={GAUGE_WIDTH} height={filledHeight()}/>
          </clipPath>
        </defs>
        <g class="player-gauge-empty">{drawGaugeShape()}</g>
        <g class="player-gauge-filled" clip-path={`url(#${fillClipPathId()})`}>{drawGaugeShape()}</g>
        <g class="player-gauge-outline">{drawGaugeShape()}</g>
      </svg>
      <div class="player-gauge-readings">
        <span class="player-gauge-label">
          <span data-testid={`${props.testId}-label`}>{props.gauge.label}</span>
          <span class="visually-hidden">{' · '}</span>
          <span data-testid={`${props.testId}-percentage`}>{props.gauge.percentageLabel}</span>
        </span>
        <span class="player-gauge-amount" data-testid={`${props.testId}-amount`}>{props.gauge.amount}</span>
      </div>
    </div>
  );
}
