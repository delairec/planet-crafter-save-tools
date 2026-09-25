import {For, Resource} from "solid-js";
import FieldsGroup from "./structure/FieldsGroup";
import FieldsGroupGrid from "./structure/FieldsGroupGrid";
import SectionState from "./structure/SectionState";
import Disclaimer from "./structure/Disclaimer";
import Icon from "~/components/Icon";
import {EnergyLevelsViewModel} from "core-mapping/presentation/viewModels/EnergyLevelsViewModel";
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
  energyLevelsSectionUnitLabel,
  energyLevelsSectionWorkInProgressIcon,
  energyLevelsSectionWorkInProgressLabel
} from "~/messages/energyLevelsSectionMessages";

interface EnergyLevelsProps {
  viewModel: Resource<EnergyLevelsViewModel>;
}

export default function EnergyLevelsSection(props: EnergyLevelsProps) {
  return (
    <SectionState title={energyLevelsSectionTitle} resource={props.viewModel}>
      {(energyLevels) => (
        <div>
          <h3>{energyLevelsSectionTitle}</h3>
          <Disclaimer>{energyLevels().submergedMachinesDisclaimer}</Disclaimer>
          <For each={energyLevels().planets}>
            {(planet) => (
              <div>
                <h4>{planet.planetId}</h4>
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
                  items={planet.productionBreakdown}
                  itemLabel={(row) => row.label}
                  columns={(row) => [
                    {header: energyLevelsSectionQuantityLabel, values: [row.quantity]},
                    {header: energyLevelsSectionUnitLabel, values: [row.unitLevel]},
                    {header: energyLevelsSectionTotalLabel, values: [row.totalLevel]}
                  ]}
                />

                <FieldsGroupGrid
                  title={<>{energyLevelsSectionConsumptionTitle} <Icon content={energyLevelsSectionWorkInProgressIcon}/> {energyLevelsSectionWorkInProgressLabel}</>}
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
