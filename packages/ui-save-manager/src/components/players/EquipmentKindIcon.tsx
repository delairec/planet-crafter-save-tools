const EQUIPMENT_ICONS_SPRITE = '/icons/equipment.svg';

interface EquipmentKindIconProps {
  icon: string;
}

export default function EquipmentKindIcon(props: EquipmentKindIconProps) {
  return (
    <svg class="slot-icon" aria-hidden="true">
      <use href={`${EQUIPMENT_ICONS_SPRITE}#${props.icon}`}/>
    </svg>
  );
}
