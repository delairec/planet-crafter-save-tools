import {For} from 'solid-js';
import {PlayerInventoryViewModel} from 'core-mapping/display/presentation/viewModels/PlayersPageViewModel';

interface InventoryChipsProps {
  inventory: PlayerInventoryViewModel;
  index: number;
}

export default function InventoryChips(props: InventoryChipsProps) {
  return (
    <div class="player-section">
      <div class="player-section-caption" data-testid={`player-${props.index}-inventory-caption`}>{props.inventory.caption}</div>
      <div class="inv">
        <For each={props.inventory.items}>
          {(item) => <span class="inv-chip">{item.label} {item.countLabel}</span>}
        </For>
        <span class="inv-chip inv-chip-empty" data-testid={`player-${props.index}-inventory-empty-slots`}>
          {props.inventory.emptySlots.label} {props.inventory.emptySlots.countLabel}
        </span>
      </div>
    </div>
  );
}
