import {For} from 'solid-js';
import {
  TerraformationLevelRowViewModel,
  TerraformationLevelsTableViewModel
} from 'core-mapping/display/presentation/viewModels/PlanetTerraformationZoneViewModel';

interface TerraformationLevelRowProps {
  row: TerraformationLevelRowViewModel;
  testId: string;
}

function TerraformationLevelRow(props: TerraformationLevelRowProps) {
  return (
    <div class="terraformation-level-row">
      <dt data-testid={`${props.testId}-label`}>{props.row.label}</dt>
      <dd class="terraformation-level-bar" aria-hidden="true">
        <span class="terraformation-level-bar-fill" style={{width: `${props.row.barWidthPercentage}%`}} data-testid={`${props.testId}-bar`}/>
      </dd>
      <dd class="terraformation-level-value" data-testid={`${props.testId}-value`}>{props.row.value}</dd>
    </div>
  );
}

interface TerraformationLevelsTableProps {
  table: TerraformationLevelsTableViewModel;
  testId: string;
}

export default function TerraformationLevelsTable(props: TerraformationLevelsTableProps) {
  return (
    <section class="card terraformation-table-card" data-testid={props.testId}>
      <div class="card-header">
        <h5 data-testid={`${props.testId}-title`}>{props.table.title}</h5>
        <span class="card-summary" data-testid={`${props.testId}-figure`}>{props.table.figure}</span>
      </div>
      <dl class="card-body terraformation-levels">
        <For each={props.table.rows}>
          {(row, index) => <TerraformationLevelRow row={row} testId={`${props.testId}-row-${index()}`}/>}
        </For>
      </dl>
    </section>
  );
}
