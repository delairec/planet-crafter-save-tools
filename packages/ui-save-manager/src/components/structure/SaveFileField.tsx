import {JSX} from 'solid-js';

interface SaveFileFieldProps {
  label: string;
  testId: string;
  ref: HTMLInputElement | ((element: HTMLInputElement) => void);
  onChange: JSX.EventHandler<HTMLInputElement, Event>;
}

export default function SaveFileField(props: SaveFileFieldProps) {
  return (
    <label class="save-file-field">
      <span class="save-file-field-label" data-testid={`${props.testId}-caption`}>{props.label}</span>
      <input ref={props.ref} data-testid={props.testId} type="file" accept="application/json" onChange={props.onChange}/>
    </label>
  );
}
