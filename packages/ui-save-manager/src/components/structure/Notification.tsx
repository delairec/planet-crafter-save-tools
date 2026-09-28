import {JSX} from "solid-js";
import {NotificationSeverity} from "core-mapping/presentation/viewModels/NotificationViewModel";
import {resolveNotificationSeverityLabel} from "~/messages/notificationMessages";

interface NotificationProps {
  severity: NotificationSeverity;
  children: JSX.Element;
  testId: string;
}

export default function Notification(props: NotificationProps) {
  return (
    <p class={`notification notification-${props.severity}`} data-testid={props.testId}>
      <span class="notification-severity-pill" data-testid={`${props.testId}-severity`}>{resolveNotificationSeverityLabel(props.severity)}</span>
      {props.children}
    </p>
  );
}
