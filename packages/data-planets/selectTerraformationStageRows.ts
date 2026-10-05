import type {TerraformationStageRow} from './TerraformationStageRow';
import terraformationStages from './terraformationStages.json' with {type: 'json'};

export function selectTerraformationStageRows(): readonly TerraformationStageRow[] {
  return terraformationStages;
}
