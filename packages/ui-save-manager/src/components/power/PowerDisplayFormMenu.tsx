import {createUniqueId, For} from 'solid-js';
import {PowerDisplayForm} from '~/providers/PowerDisplayFormProvider.tsx';
import {usePowerDisplayForm} from '~/hooks/usePowerDisplayForm';
import {powerDisplayFormBarsOption, powerDisplayFormLabel, powerDisplayFormTableOption} from '~/messages/powerPageMessages';

interface PowerDisplayFormOption {
  form: PowerDisplayForm;
  label: string;
}

const DISPLAY_FORM_OPTIONS: PowerDisplayFormOption[] = [
  {form: 'bars', label: powerDisplayFormBarsOption},
  {form: 'table', label: powerDisplayFormTableOption}
];

export default function PowerDisplayFormMenu() {
  const displayForm = usePowerDisplayForm();
  const selectId = createUniqueId();
  return (
    <span class="power-display-form">
      <label for={selectId} data-testid="power-display-form-label">{powerDisplayFormLabel}</label>
      <select id={selectId} data-testid="power-display-form"
              onChange={(event) => displayForm.chooseForm(DISPLAY_FORM_OPTIONS[event.currentTarget.selectedIndex].form)}>
        <For each={DISPLAY_FORM_OPTIONS}>
          {(option) => (
            <option value={option.form} selected={displayForm.form() === option.form} data-testid={`power-display-form-option-${option.form}`}>
              {option.label}
            </option>
          )}
        </For>
      </select>
    </span>
  );
}
