import {For} from "solid-js";
import FieldsGroup, {Column} from "./FieldsGroup";

interface FieldsGroupGridProps<T> {
  title: string;
  items: T[];
  itemLabel: (item: T) => string;
  columns: (item: T) => Column[];
}

export default function FieldsGroupGrid<T>(props: FieldsGroupGridProps<T>) {
  return (
    <>
      <h5>{props.title}</h5>
      <div class="grid-container">
        <For each={props.items}>
          {(item) => (
            <div class="grid-item">
              <h5>{props.itemLabel(item)}</h5>
              <FieldsGroup columns={() => props.columns(item)}/>
            </div>
          )}
        </For>
      </div>
    </>
  );
}
