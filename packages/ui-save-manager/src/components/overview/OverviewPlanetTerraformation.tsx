import {For} from 'solid-js';
import {OverviewPlanetTerraformationViewModel} from 'core-mapping/display/presentation/viewModels/OverviewPageViewModel';

interface OverviewPlanetTerraformationProps {
  terraformation: OverviewPlanetTerraformationViewModel;
  testId: string;
}

export default function OverviewPlanetTerraformation(props: OverviewPlanetTerraformationProps) {
  return (
    <div class="overview-planet-terraformation">
      <p class="overview-planet-index">
        <span class="overview-planet-index-value" data-testid={`${props.testId}-terraformation-index`}>{props.terraformation.terraformationIndex.value}</span>
        <span class="overview-planet-index-label">{props.terraformation.terraformationIndex.label}</span>
      </p>
      <dl class="key-values">
        <For each={props.terraformation.figures}>
          {(figure, figureIndex) => (
            <div class="key-value" data-testid={`${props.testId}-figure-${figureIndex()}`}>
              <dt data-testid={`${props.testId}-figure-${figureIndex()}-label`}>{figure.label}</dt>
              <dd data-testid={`${props.testId}-figure-${figureIndex()}-value`}>{figure.value}</dd>
            </div>
          )}
        </For>
      </dl>
    </div>
  );
}
