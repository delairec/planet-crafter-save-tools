import {PlanetTerraformationZoneViewModel} from 'core-mapping/display/presentation/viewModels/PlanetTerraformationZoneViewModel';
import TerraformationHeroFigure from '~/components/terraformation/TerraformationHeroFigure';
import TerraformationLevelsTable from '~/components/terraformation/TerraformationLevelsTable';

interface TerraformationPlanetZoneProps {
  zone: PlanetTerraformationZoneViewModel;
}

export default function TerraformationPlanetZone(props: TerraformationPlanetZoneProps) {
  return (
    <div class="terraformation-planet-zone">
      <h4 data-testid="terraformation-planet-title">{props.zone.planetName}</h4>
      <div class="terraformation-heroes">
        <TerraformationHeroFigure figure={props.zone.terraformationIndex} testId="terraformation-index"/>
        <TerraformationHeroFigure figure={props.zone.biomass} testId="terraformation-biomass"/>
      </div>
      <div class="terraformation-tables">
        <TerraformationLevelsTable table={props.zone.environmentalLevels} testId="terraformation-environmental-levels"/>
        <TerraformationLevelsTable table={props.zone.organicLevels} testId="terraformation-organic-levels"/>
      </div>
    </div>
  );
}
