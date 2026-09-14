import {
  disclaimerBulletIcon,
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
import Icon from "~/components/Icon";

export default function HomeDisclaimer() {

  const [isOpen, setIsOpen] = createSignal<boolean>(false);

  return (
    <details class="surface surface-warning">
      <summary class="text-center" onClick={() => setIsOpen((previous) => !previous)}>
        {isOpen() ? hideDisclaimersLabel : showDisclaimersLabel}
      </summary>
      <p>
        <strong><Icon content={disclaimerBulletIcon}/> {privacyDisclaimerLabel}</strong>: {privacyDisclaimerMessage}
      </p>
      <p>
        <strong><Icon content={disclaimerBulletIcon}/> {securityDisclaimerLabel}</strong>: {securityDisclaimerMessage}
      </p>
      <p>
        <strong><Icon
          content={disclaimerBulletIcon}/> {fileSafetyDisclaimerLabel}</strong>: {fileSafetyDisclaimerMessage}
      </p>
    </details>)
}
