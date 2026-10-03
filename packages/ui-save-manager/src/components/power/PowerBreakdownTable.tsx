import {For} from 'solid-js';
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
      <th scope="row">{props.row.label}</th>
      <td class="power-table-figure">{props.row.quantity}</td>
      <td class="power-table-figure">{props.row.unitLevel}</td>
      <td class="power-table-figure">{props.row.totalLevel}</td>
      <td class="power-table-figure">{props.row.share}</td>
    </tr>
  );
}

interface PowerBreakdownTableProps {
  table: PowerBreakdownTableViewModel;
  testId: string;
}

export default function PowerBreakdownTable(props: PowerBreakdownTableProps) {
  return (
    <section class="power-table-section">
      <h5 class="power-table-title" data-testid={`${props.testId}-title`}>{props.table.title}</h5>
      <table class="power-table" data-testid={props.testId}>
        <thead>
          <tr>
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
    </section>
  );
}
