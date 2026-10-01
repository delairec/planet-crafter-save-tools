import {For, Resource} from "solid-js";
import FieldsGroup from "./structure/FieldsGroup";
import FieldsGroupGrid from "./structure/FieldsGroupGrid";
import SectionState from "./structure/SectionState";
import Notification from "./structure/Notification";
import {EnergyLevelsViewModel} from "core-mapping/display/presentation/viewModels/EnergyLevelsViewModel";
import {
  energyLevelsSectionBoostedMachinesLabel,
  energyLevelsSectionConsumptionTitle,
  energyLevelsSectionContributionLabel,
  energyLevelsSectionEnergyFusesLabel,
  energyLevelsSectionOptimizersTitle,
  energyLevelsSectionProductionTitle,
  energyLevelsSectionQuantityLabel,
  energyLevelsSectionTitle,
  energyLevelsSectionTotalLabel,
  energyLevelsSectionUnitLabel
} from "~/messages/energyLevelsSectionMessages";

interface EnergyLevelsProps {
  viewModel: Resource<EnergyLevelsViewModel>;
}

export default function EnergyLevelsSection(props: EnergyLevelsProps) {
  return (
    <SectionState title={energyLevelsSectionTitle} resource={props.viewModel}>
      {(energyLevels) => (
        <div>
          <h3 data-testid="energy-levels-title">{energyLevelsSectionTitle}</h3>
          <For each={energyLevels().notifications}>
            {(notification, index) => <Notification severity={notification.severity} testId={`energy-levels-notification-${index()}`}>{notification.message}</Notification>}
          </For>
          <For each={energyLevels().planets}>
            {(planet, planetIndex) => (
              <div>
                <h4 data-testid={`energy-levels-planet-${planetIndex()}-title`}>{planet.planetId}</h4>
                <div class="fields-group-container">
                  <FieldsGroup columns={() => planet.energyLevels.columns}/>
                </div>

                <FieldsGroupGrid
                  title={energyLevelsSectionOptimizersTitle}
                  items={planet.optimizers}
                  itemLabel={(optimizer) => optimizer.label}
                  columns={(optimizer) => [
                    {header: energyLevelsSectionEnergyFusesLabel, values: [optimizer.fuseCount]},
                    {header: energyLevelsSectionBoostedMachinesLabel, values: [optimizer.boostedMachines]},
                    {header: energyLevelsSectionContributionLabel, values: [optimizer.contribution]}
                  ]}
                />

                <FieldsGroupGrid
                  title={energyLevelsSectionProductionTitle}
                  testId={`energy-production-${planetIndex()}`}
                  items={planet.productionBreakdown}
                  itemLabel={(row) => row.label}
                  columns={(row) => [
                    {header: energyLevelsSectionQuantityLabel, values: [row.quantity]},
                    {header: energyLevelsSectionUnitLabel, values: [row.unitLevel]},
                    {header: energyLevelsSectionTotalLabel, values: [row.totalLevel]}
                  ]}
                />

                <FieldsGroupGrid
                  title={energyLevelsSectionConsumptionTitle}
                  items={planet.consumptionBreakdown}
                  itemLabel={(row) => row.label}
                  columns={(row) => [
                    {header: energyLevelsSectionQuantityLabel, values: [row.quantity]},
                    {header: energyLevelsSectionUnitLabel, values: [row.unitLevel]},
                    {header: energyLevelsSectionTotalLabel, values: [row.totalLevel]}
                  ]}
                />
              </div>
            )}
          </For>
        </div>
      )}
    </SectionState>
  );
}
