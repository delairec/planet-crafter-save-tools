import {TonedValueViewModel} from "core-mapping/presentation/viewModels/ConfigurationPageViewModel";
import {toneBadgeSeparator} from "~/messages/configurationPageMessages";

interface ToneBadgeProps {
  badge: TonedValueViewModel;
  testId: string;
}

export default function ToneBadge(props: ToneBadgeProps) {
  return (
    <span class={`tone-badge tone-badge-${props.badge.tone}`} data-testid={props.testId}>
      {props.badge.value}
      <span class="visually-hidden" data-testid={`${props.testId}-tone`}>{toneBadgeSeparator}{props.badge.toneLabel}</span>
    </span>
  );
}
