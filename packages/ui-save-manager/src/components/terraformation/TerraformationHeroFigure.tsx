import {TerraformationHeroFigureViewModel} from 'core-mapping/display/presentation/viewModels/PlanetTerraformationZoneViewModel';

interface TerraformationHeroFigureProps {
  figure: TerraformationHeroFigureViewModel;
  testId: string;
}

export default function TerraformationHeroFigure(props: TerraformationHeroFigureProps) {
  return (
    <div class="terraformation-hero" data-testid={props.testId}>
      <p class="terraformation-hero-value" data-testid={`${props.testId}-value`}>{props.figure.value}</p>
      <p class="terraformation-hero-caption" data-testid={`${props.testId}-caption`}>{props.figure.caption}</p>
    </div>
  );
}
