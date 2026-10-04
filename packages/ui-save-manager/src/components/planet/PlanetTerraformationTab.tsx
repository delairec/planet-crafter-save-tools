import {Show} from 'solid-js';
import {PlanetTerraformationTabViewModel} from 'core-mapping/display/presentation/viewModels/PlanetPageViewModel';
import TerraformationPlanetZone from '~/components/terraformation/TerraformationPlanetZone';

interface PlanetTerraformationTabProps {
  tab: PlanetTerraformationTabViewModel;
}

export default function PlanetTerraformationTab(props: PlanetTerraformationTabProps) {
  return (
    <Show when={props.tab.zone} fallback={<p class="planet-absent-zone" data-testid="planet-terraformation-absent">{props.tab.absentZone}</p>}>
      {(zone) => <TerraformationPlanetZone zone={zone()}/>}
    </Show>
  );
}
