import type {WorldObjectLabelRow} from './WorldObjectLabelRow';
import worldObjectLabels from './worldObjectLabels.json' with {type: 'json'};

export function selectWorldObjectLabelRows(): readonly WorldObjectLabelRow[] {
  return worldObjectLabels;
}
