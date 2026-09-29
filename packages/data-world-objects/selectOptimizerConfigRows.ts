import type {OptimizerConfigRow} from './OptimizerConfigRow';
import optimizerConfig from './optimizerConfig.json' with {type: 'json'};

export function selectOptimizerConfigRows(): readonly OptimizerConfigRow[] {
  return optimizerConfig;
}
