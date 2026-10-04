interface EquipmentKindIconProps {
  icon: string;
}

export default function EquipmentKindIcon(props: EquipmentKindIconProps) {
  return (
    <span class="slot-tile">
      <svg class="slot-tile-shape" viewBox="0 0 44 44" aria-hidden="true">
        <polygon points="7,0.5 43.5,0.5 43.5,37 37,43.5 0.5,43.5 0.5,7"/>
      </svg>
      <svg class="slot-icon" viewBox="0 0 24 24" aria-hidden="true">
        <use href={`#${props.icon}`}/>
      </svg>
    </span>
  );
}
