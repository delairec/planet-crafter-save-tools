import {JSX} from "solid-js";
import {NotificationSeverity} from "core-mapping/presentation/viewModels/NotificationViewModel";

interface NotificationProps {
  severity: NotificationSeverity;
  children: JSX.Element;
}

export default function Notification(props: NotificationProps) {
  return <p class={`notification notification-${props.severity}`}>{props.children}</p>;
}
