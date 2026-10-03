export type PowerBalance = 'deficit' | 'tight' | 'surplus' | 'balanced';

export interface PowerFigures {
  readonly production: number;
  readonly consumption: number;
  readonly available: number;
}

const TIGHT_MARGIN_SHARE_OF_PRODUCTION = 0.1;
const NO_POWER = 0;

export function assessPowerBalance({production, consumption, available}: PowerFigures): PowerBalance {
  if (production === NO_POWER) {
    return consumption > NO_POWER ? 'deficit' : 'balanced';
  }
  if (available < NO_POWER) {
    return 'deficit';
  }
  if (available < production * TIGHT_MARGIN_SHARE_OF_PRODUCTION) {
    return 'tight';
  }

  return 'surplus';
}
