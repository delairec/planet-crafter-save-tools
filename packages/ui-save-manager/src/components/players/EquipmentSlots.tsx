import {createSignal, createUniqueId, For} from 'solid-js';
import {PlayerEquipmentViewModel} from 'core-mapping/display/presentation/viewModels/PlayersPageViewModel';
import EquipmentKindIcon from '~/components/players/EquipmentKindIcon';

interface EquipmentSlotsProps {
  equipment: PlayerEquipmentViewModel;
  index: number;
}

export default function EquipmentSlots(props: EquipmentSlotsProps) {
  const [isUnfolded, setIsUnfolded] = createSignal(false);
  const slotsId = createUniqueId();

  return (
    <div class="player-section player-equipment" classList={{'player-equipment-unfolded': isUnfolded()}}>
      <div class="player-section-caption player-equipment-caption" data-testid={`player-${props.index}-equipment-caption`}>{props.equipment.caption}</div>
      <button type="button" class="player-equipment-toggle" aria-expanded={isUnfolded()} aria-controls={slotsId}
              data-testid={`player-${props.index}-show-equipment`} onClick={() => setIsUnfolded((unfolded) => !unfolded)}>
        {props.equipment.caption}
      </button>
      <div id={slotsId} class="slots" data-testid={`player-${props.index}-equipment-slots`}>
        <For each={props.equipment.slots}>
          {(slot) => (
            <div class={slot.isEmpty ? 'slot empty' : 'slot'}>
              <EquipmentKindIcon icon={slot.icon}/>
              <div class="slot-text">
                <small class="slot-kind">{slot.kindLabel}</small>
                <span class="slot-item">{slot.itemLabel}</span>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
