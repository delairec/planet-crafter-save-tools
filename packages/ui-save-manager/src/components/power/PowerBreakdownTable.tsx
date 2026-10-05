import {createUniqueId, For} from 'solid-js';
import ColumnNamedCell from '~/components/power/ColumnNamedCell';
import {PowerBreakdownRowViewModel, PowerBreakdownTableViewModel} from 'core-mapping/display/presentation/viewModels/PlanetPowerZoneViewModel';
import {
  powerMachineHeader,
  powerQuantityHeader,
  powerShareHeader,
  powerTotalHeader,
  powerUnitHeader
} from '~/messages/powerPageMessages';

interface PowerBreakdownRowProps {
  row: PowerBreakdownRowViewModel;
  testId: string;
}

function PowerBreakdownRow(props: PowerBreakdownRowProps) {
  return (
    <tr data-testid={props.testId}>
      <th scope="row" data-testid={`${props.testId}-machine`}>{props.row.label}</th>
      <ColumnNamedCell column={powerQuantityHeader} testId={`${props.testId}-quantity`} class="power-table-figure">{props.row.quantity}</ColumnNamedCell>
      <ColumnNamedCell column={powerUnitHeader} testId={`${props.testId}-unit`} class="power-table-figure">{props.row.unitLevel}</ColumnNamedCell>
      <ColumnNamedCell column={powerTotalHeader} testId={`${props.testId}-total`} class="power-table-figure">{props.row.totalLevel}</ColumnNamedCell>
      <ColumnNamedCell column={powerShareHeader} testId={`${props.testId}-share`} class="power-table-figure">{props.row.share}</ColumnNamedCell>
    </tr>
  );
}

interface PowerBreakdownTableProps {
  table: PowerBreakdownTableViewModel;
  testId: string;
}

export default function PowerBreakdownTable(props: PowerBreakdownTableProps) {
  const titleId = createUniqueId();
  return (
    <section class="card power-table-card">
      <div class="card-header">
        <h5 id={titleId} data-testid={`${props.testId}-title`}>{props.table.title}</h5>
      </div>
      <div class="card-body power-table-body" role="region" aria-labelledby={titleId} tabindex="0" data-testid={`${props.testId}-body`}>
        <table class="power-table" data-testid={props.testId}>
          <thead>
            <tr data-testid={`${props.testId}-column-names`}>
              <th scope="col">{powerMachineHeader}</th>
              <th scope="col" class="power-table-figure">{powerQuantityHeader}</th>
              <th scope="col" class="power-table-figure">{powerUnitHeader}</th>
              <th scope="col" class="power-table-figure">{powerTotalHeader}</th>
              <th scope="col" class="power-table-figure">{powerShareHeader}</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.table.rows}>
              {(row, index) => <PowerBreakdownRow row={row} testId={`${props.testId}-row-${index()}`}/>}
            </For>
          </tbody>
          <tfoot>
            <PowerBreakdownRow row={props.table.total} testId={`${props.testId}-total`}/>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
