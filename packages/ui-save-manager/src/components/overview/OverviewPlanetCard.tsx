import {createUniqueId, Show} from 'solid-js';
import {OverviewPlanetCardViewModel} from 'core-mapping/display/presentation/viewModels/OverviewPageViewModel';
import OverviewPlanetTerraformation from '~/components/overview/OverviewPlanetTerraformation';
import OverviewPlanetPower from '~/components/overview/OverviewPlanetPower';
import {overviewPlanetDetailsButtonDescription, overviewPlanetDetailsButtonLabel} from '~/messages/overviewPageMessages';

interface OverviewPlanetAbsentSideProps {
  absentSide: string | undefined;
  testId: string;
}

function OverviewPlanetAbsentSide(props: OverviewPlanetAbsentSideProps) {
  return (
    <Show when={props.absentSide}>
      {(absentSide) => <p class="overview-planet-absent-side" data-testid={`${props.testId}-absent-side`}>{absentSide()}</p>}
    </Show>
  );
}

interface OverviewPlanetDetailsButtonProps {
  testId: string;
}

function OverviewPlanetDetailsButton(props: OverviewPlanetDetailsButtonProps) {
  const tooltipId = createUniqueId();
  return (
    <span class="tooltip-anchor">
      <button type="button" aria-disabled="true" aria-describedby={tooltipId} data-testid={`${props.testId}-details`}>
        {overviewPlanetDetailsButtonLabel}
      </button>
      <span id={tooltipId} role="tooltip" class="tooltip" data-testid={`${props.testId}-details-description`}>
        {overviewPlanetDetailsButtonDescription}
      </span>
    </span>
  );
}

interface OverviewPlanetCardProps {
  card: OverviewPlanetCardViewModel;
  testId: string;
}

export default function OverviewPlanetCard(props: OverviewPlanetCardProps) {
  return (
    <article class="overview-planet-card" data-testid={props.testId}>
      <header class="overview-planet-head">
        <h4 class="overview-planet-name" data-testid={`${props.testId}-name`}>{props.card.name}</h4>
        <Show when={props.card.terraformationStage}>
          {(stage) => (
            <p class="overview-planet-stage">
              <span class="visually-hidden" data-testid={`${props.testId}-terraformation-stage-label`}>{stage().label}</span>
              <span class="tone-badge tone-badge-neutral" data-testid={`${props.testId}-terraformation-stage`}>{stage().value}</span>
            </p>
          )}
        </Show>
      </header>
      <Show when={props.card.terraformation} fallback={<OverviewPlanetAbsentSide absentSide={props.card.absentSide} testId={props.testId}/>}>
        {(terraformation) => <OverviewPlanetTerraformation terraformation={terraformation()} testId={props.testId}/>}
      </Show>
      <Show when={props.card.power} fallback={<div class="overview-planet-foot"><OverviewPlanetAbsentSide absentSide={props.card.absentSide} testId={props.testId}/></div>}>
        {(power) => <OverviewPlanetPower power={power()} testId={props.testId}/>}
      </Show>
      <footer class="overview-planet-actions">
        <OverviewPlanetDetailsButton testId={props.testId}/>
      </footer>
    </article>
  );
}
