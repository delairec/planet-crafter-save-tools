import {For} from "solid-js";
import Card from "~/components/structure/Card";
import ToneBadge from "~/components/structure/ToneBadge";
import {ModifiersZoneViewModel} from "core-mapping/display/presentation/viewModels/ConfigurationPageViewModel";
import {modifiersCardSummary, modifiersCardTitle} from "~/messages/configurationPageMessages";

interface ModifiersCardProps {
  modifiers: ModifiersZoneViewModel;
}

export default function ModifiersCard(props: ModifiersCardProps) {
  return (
    <Card title={modifiersCardTitle} summary={modifiersCardSummary} testId="modifiers">
      <dl class="key-values">
        <For each={props.modifiers.modifiers}>
          {(modifier, modifierIndex) => (
            <div class="key-value" data-testid={`modifier-${modifierIndex()}`}>
              <dt>{modifier.label}</dt>
              <dd><ToneBadge badge={modifier.badge} testId={`modifier-${modifierIndex()}-badge`}/></dd>
            </div>
          )}
        </For>
      </dl>
    </Card>
  );
}
