import {For} from "solid-js";
import Card from "~/components/structure/Card";
import OnOffPill from "~/components/structure/OnOffPill";
import {UnlocksZoneViewModel} from "core-mapping/display/presentation/viewModels/ConfigurationPageViewModel";
import {unlocksCardTitle} from "~/messages/configurationPageMessages";

interface UnlocksCardProps {
  unlocks: UnlocksZoneViewModel;
}

export default function UnlocksCard(props: UnlocksCardProps) {
  return (
    <Card title={unlocksCardTitle} testId="unlocks">
      <dl class="key-values">
        <For each={props.unlocks.flags}>
          {(flag, flagIndex) => (
            <div class="key-value" data-testid={`unlock-${flagIndex()}`}>
              <dt>{flag.label}</dt>
              <dd><OnOffPill state={flag.state} label={flag.stateLabel} testId={`unlock-${flagIndex()}-state`}/></dd>
            </div>
          )}
        </For>
      </dl>
    </Card>
  );
}
