import {spinnerLoadingLabel} from "~/messages/spinnerMessages";

interface SpinnerProps {
  label?: string;
  testId?: string;
}

export default function Spinner(props: SpinnerProps) {
  return (
    <span class="spinner-container" role="status" data-testid={props.testId}>
      <span class="spinner" aria-hidden="true" data-testid={props.testId ? `${props.testId}-animation` : undefined}/>
      <span>{props.label ?? spinnerLoadingLabel}</span>
    </span>
  );
}
