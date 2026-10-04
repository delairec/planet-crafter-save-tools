import {useContext} from 'solid-js';
import {PowerDisplayFormChoice, PowerDisplayFormContext} from "~/providers/PowerDisplayFormProvider.tsx";

export function usePowerDisplayForm(): PowerDisplayFormChoice {
  const displayFormChoice = useContext(PowerDisplayFormContext);
  if (!displayFormChoice) {
    throw new Error('usePowerDisplayForm is called outside of a PowerDisplayFormProvider.');
  }

  return displayFormChoice;
}
