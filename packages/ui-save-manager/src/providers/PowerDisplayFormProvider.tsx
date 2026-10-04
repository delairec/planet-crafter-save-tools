import {Accessor, createContext, createSignal, JSX} from "solid-js";

export type PowerDisplayForm = 'bars' | 'table';

export interface PowerDisplayFormChoice {
  form: Accessor<PowerDisplayForm>;
  chooseForm: (form: PowerDisplayForm) => void;
}

export const PowerDisplayFormContext = createContext<PowerDisplayFormChoice>();

interface PowerDisplayFormProviderProps {
  children: JSX.Element;
}

export function PowerDisplayFormProvider(props: PowerDisplayFormProviderProps) {
  const [form, setForm] = createSignal<PowerDisplayForm>('bars');

  const displayFormChoice: PowerDisplayFormChoice = {
    form,
    chooseForm: (chosenForm) => setForm(chosenForm)
  };

  return <PowerDisplayFormContext.Provider value={displayFormChoice}>{props.children}</PowerDisplayFormContext.Provider>;
}
