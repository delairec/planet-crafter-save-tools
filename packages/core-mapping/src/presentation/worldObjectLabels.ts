import {WorldObjectName} from "../domain/worldObjectNames";
import worldObjectLabelRows from './worldObjectLabels.json' with {type: 'json'};

export const worldObjectLabels = Object.fromEntries(
  worldObjectLabelRows.map((worldObjectLabel) => [worldObjectLabel.worldObjectName, worldObjectLabel.label])
) as Record<WorldObjectName, string>;

export type WorldObjectLabel = typeof worldObjectLabels[WorldObjectName];
