interface HostBadgeProps {
  label: string;
}

export default function HostBadge(props: HostBadgeProps) {
  return <span class="host-badge">{props.label}</span>;
}
