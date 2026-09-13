import {
  disclaimerBulletEmoji,
  fileSafetyDisclaimerLabel,
  fileSafetyDisclaimerMessage,
  hideDisclaimersLabel,
  privacyDisclaimerLabel,
  privacyDisclaimerMessage,
  securityDisclaimerLabel,
  securityDisclaimerMessage,
  showDisclaimersLabel
} from "~/messages/appMessages";
import {createSignal} from "solid-js";
import Emoji from "~/components/Emoji";

export default function HomeDisclaimer() {

  const [isOpen, setIsOpen] = createSignal<boolean>(false);

  return (
    <details class="surface surface-warning">
      <summary class="text-center" onClick={() => setIsOpen((previous) => !previous)}>
        {isOpen() ? hideDisclaimersLabel : showDisclaimersLabel}
      </summary>
      <p>
        <strong><Emoji content={disclaimerBulletEmoji}/> {privacyDisclaimerLabel}</strong>: {privacyDisclaimerMessage}
      </p>
      <p>
        <strong><Emoji content={disclaimerBulletEmoji}/> {securityDisclaimerLabel}</strong>: {securityDisclaimerMessage}
      </p>
      <p>
        <strong><Emoji
          content={disclaimerBulletEmoji}/> {fileSafetyDisclaimerLabel}</strong>: {fileSafetyDisclaimerMessage}
      </p>
    </details>)
}
