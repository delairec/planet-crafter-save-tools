import {createUniqueId} from 'solid-js';
import Icon from '~/components/Icon';

interface IconButtonProps {
  icon: string;
  label: string;
  testId: string;
  onClick: () => void;
  disabled: boolean;
  class?: string;
}

export default function IconButton(props: IconButtonProps) {
  const tooltipId = createUniqueId();
  return (
    <span class={`tooltip-anchor icon-button ${props.class ?? ''}`}>
      <button aria-labelledby={tooltipId} data-testid={props.testId} onClick={() => props.onClick()} disabled={props.disabled}>
        <Icon content={props.icon}/>
      </button>
      <span id={tooltipId} role="tooltip" class="tooltip" data-testid={`${props.testId}-tooltip`}>{props.label}</span>
    </span>
  );
}
