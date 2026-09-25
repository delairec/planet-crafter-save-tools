import {createUniqueId} from 'solid-js';
import Icon from '~/components/Icon';

interface IconButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  disabled: boolean;
  class?: string;
}

export default function IconButton(props: IconButtonProps) {
  const tooltipId = createUniqueId();
  return (
    <span class={`icon-button ${props.class ?? ''}`}>
      <button aria-labelledby={tooltipId} onClick={() => props.onClick()} disabled={props.disabled}>
        <Icon content={props.icon}/>
      </button>
      <span id={tooltipId} role="tooltip" class="tooltip">{props.label}</span>
    </span>
  );
}
