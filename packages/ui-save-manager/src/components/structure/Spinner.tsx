import {spinnerLoadingLabel} from "~/messages/spinnerMessages";

interface SpinnerProps {
  label?: string;
  testId?: string;
}

export default function Spinner(props: SpinnerProps) {
  return (
    <span class="spinner-container" role="status" data-testid={props.testId}>
      <span class="spinner" aria-hidden="true"/>
      <span>{props.label ?? spinnerLoadingLabel}</span>
    </span>
  );
}
