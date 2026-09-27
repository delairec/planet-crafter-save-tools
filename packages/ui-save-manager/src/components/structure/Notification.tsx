import {JSX} from "solid-js";
import {NotificationSeverity} from "core-mapping/presentation/viewModels/NotificationViewModel";

interface NotificationProps {
  severity: NotificationSeverity;
  children: JSX.Element;
  testId: string;
}

export default function Notification(props: NotificationProps) {
  return <p class={`notification notification-${props.severity}`} data-testid={props.testId}>{props.children}</p>;
}
