import {
  hideValidationMessagesDetails,
  showValidationMessagesDetails,
  validationMessageLocationPrefix
} from "~/messages/validationMessages";
import {createSignal, For, Show} from "solid-js";
import {SaveValidationMessageViewModel} from "core-mapping/presentation/viewModels/SaveFileValidationViewModel";

export default function ValidationMessagesList(props: {
  title: string,
  severity: 'danger' | 'warning',
  messages: SaveValidationMessageViewModel[]
}) {

  const [isOpen, setIsOpen] = createSignal<boolean>(false);

  return <>
    <p class={`text-color-${props.severity}`}>{props.title}</p>
    <details>
      <summary onClick={() => setIsOpen((previous) => !previous)}>
        {isOpen() ? hideValidationMessagesDetails : showValidationMessagesDetails}
      </summary>
      <ul>
        <For each={props.messages}>
          {(validationMessage) => <li class="validation-message">
            <code>
              {validationMessage.message}
              <Show when={validationMessage.location}>
                <span
                  class="validation-message-location">{validationMessageLocationPrefix} {validationMessage.location}</span>
              </Show>
            </code>
          </li>}
        </For>
      </ul>
    </details>
  </>
}
