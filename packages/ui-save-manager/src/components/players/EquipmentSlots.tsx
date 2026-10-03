import {For} from 'solid-js';
import {PlayerEquipmentViewModel} from 'core-mapping/display/presentation/viewModels/PlayersPageViewModel';

interface EquipmentSlotsProps {
  equipment: PlayerEquipmentViewModel;
  index: number;
}

export default function EquipmentSlots(props: EquipmentSlotsProps) {
  return (
    <div class="player-section">
      <div class="player-section-caption" data-testid={`player-${props.index}-equipment-caption`}>{props.equipment.caption}</div>
      <div class="slots">
        <For each={props.equipment.slots}>
          {(slot) => (
            <div class={slot.isEmpty ? 'slot empty' : 'slot'}>
              <small class="slot-kind">{slot.kindLabel}</small>
              <div>{slot.itemLabel}</div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
