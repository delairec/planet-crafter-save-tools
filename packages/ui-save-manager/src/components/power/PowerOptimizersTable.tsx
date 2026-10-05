import {createUniqueId, For} from 'solid-js';
import ColumnNamedCell from '~/components/power/ColumnNamedCell';
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
  const titleId = createUniqueId();
  return (
    <section class="card power-table-card">
      <div class="card-header">
        <h5 id={titleId} data-testid="power-optimizers-title">{props.optimizers.title}</h5>
        <span class="card-summary" data-testid="power-optimizers-summary">{props.optimizers.summary}</span>
      </div>
      <div class="card-body power-table-body" role="region" aria-labelledby={titleId} tabindex="0" data-testid="power-optimizers-body">
        <table class="power-table" data-testid="power-optimizers">
          <thead>
            <tr data-testid="power-optimizers-column-names">
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
                  <th scope="row" data-testid={`power-optimizers-row-${index()}-optimizer`}>{row.label}</th>
                  <ColumnNamedCell column={powerEnergyFusesHeader} testId={`power-optimizers-row-${index()}-fuses`}>{row.fuses}</ColumnNamedCell>
                  <ColumnNamedCell column={powerBoostedMachinesHeader} testId={`power-optimizers-row-${index()}-boosted-machines`}>
                    {row.boostedMachines}
                  </ColumnNamedCell>
                  <ColumnNamedCell column={powerContributionHeader} testId={`power-optimizers-row-${index()}-contribution`} class="power-table-figure">
                    {row.contribution}
                  </ColumnNamedCell>
                  <ColumnNamedCell column={powerShareHeader} testId={`power-optimizers-row-${index()}-share`} class="power-table-figure">
                    {row.share}
                  </ColumnNamedCell>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </section>
  );
}
