import {UnlockStateViewModel} from "core-mapping/display/presentation/viewModels/ConfigurationPageViewModel";

interface OnOffPillProps {
  state: UnlockStateViewModel;
  label: string;
  testId: string;
}

export default function OnOffPill(props: OnOffPillProps) {
  return <span class={`on-off-pill on-off-pill-${props.state}`} data-testid={props.testId}>{props.label}</span>;
}
