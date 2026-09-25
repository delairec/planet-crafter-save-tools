import {createUniqueId} from 'solid-js';

interface CheckboxFieldProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function CheckboxField(props: CheckboxFieldProps) {
  const tooltipId = createUniqueId();
  return (
    <span class="tooltip-anchor checkbox-field">
      <label>
        <input type="checkbox" aria-describedby={tooltipId} checked={props.checked}
               onChange={(event) => props.onChange(event.currentTarget.checked)}/>
        {props.label}
      </label>
      <span id={tooltipId} role="tooltip" class="tooltip">{props.description}</span>
    </span>
  );
}
