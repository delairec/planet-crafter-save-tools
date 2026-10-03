import {For} from 'solid-js';
import {PowerOptimizersViewModel} from 'core-mapping/display/presentation/viewModels/PlanetPowerZoneViewModel';
import {
  powerBoostedMachinesHeader,
  powerContributionHeader,
  powerEnergyFusesHeader,
  powerOptimizerHeader,
  powerShareHeader
} from '~/messages/powerPageMessages';

interface PowerOptimizersTableProps {
  optimizers: PowerOptimizersViewModel;
}

export default function PowerOptimizersTable(props: PowerOptimizersTableProps) {
  return (
    <section class="card power-table-card">
      <div class="card-header">
        <h5 data-testid="power-optimizers-title">{props.optimizers.title}</h5>
        <span class="card-summary" data-testid="power-optimizers-summary">{props.optimizers.summary}</span>
      </div>
      <div class="card-body power-table-body">
        <table class="power-table" data-testid="power-optimizers">
          <thead>
            <tr>
              <th scope="col">{powerOptimizerHeader}</th>
              <th scope="col">{powerEnergyFusesHeader}</th>
              <th scope="col">{powerBoostedMachinesHeader}</th>
              <th scope="col" class="power-table-figure">{powerContributionHeader}</th>
              <th scope="col" class="power-table-figure">{powerShareHeader}</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.optimizers.rows}>
              {(row, index) => (
                <tr data-testid={`power-optimizers-row-${index()}`}>
                  <th scope="row">{row.label}</th>
                  <td>{row.fuses}</td>
                  <td>{row.boostedMachines}</td>
                  <td class="power-table-figure">{row.contribution}</td>
                  <td class="power-table-figure">{row.share}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </section>
  );
}
