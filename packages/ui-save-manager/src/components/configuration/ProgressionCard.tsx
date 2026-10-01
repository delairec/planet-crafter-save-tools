import {For, Show} from "solid-js";
import Card from "~/components/structure/Card";
import ToneBadge from "~/components/structure/ToneBadge";
import {ProgressionZoneViewModel} from "core-mapping/display/presentation/viewModels/ConfigurationPageViewModel";
import {progressionCardTitle} from "~/messages/configurationPageMessages";

interface ProgressionCardProps {
  progression: ProgressionZoneViewModel;
}

export default function ProgressionCard(props: ProgressionCardProps) {
  return (
    <Card title={progressionCardTitle} testId="global-progression">
      <dl class="key-values">
        <For each={props.progression.fields}>
          {(field, fieldIndex) => (
            <div class="key-value" data-testid={`global-progression-field-${fieldIndex()}`}>
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          )}
        </For>
        <Show when={props.progression.droneLogistics}>
          {(droneLogistics) => (
            <div class="key-value" data-testid="drone-logistics">
              <dt>{droneLogistics().label}</dt>
              <dd><ToneBadge badge={droneLogistics().badge} testId="drone-logistics-badge"/></dd>
            </div>
          )}
        </Show>
      </dl>
    </Card>
  );
}
