import {For, JSX} from "solid-js";
import FieldsGroup, {ColumnViewModel} from "./FieldsGroup";

interface FieldsGroupGridProps<T> {
  title: JSX.Element;
  items: T[];
  itemLabel: (item: T) => string;
  columns: (item: T) => ColumnViewModel[];
  testId?: string;
}

export default function FieldsGroupGrid<T>(props: FieldsGroupGridProps<T>) {
  return (
    <>
      <h5>{props.title}</h5>
      <div class="grid-container">
        <For each={props.items}>
          {(item) => (
            <div class="grid-item">
              <h5 data-testid={props.testId && `${props.testId}-item-label`}>{props.itemLabel(item)}</h5>
              <FieldsGroup columns={() => props.columns(item)}/>
            </div>
          )}
        </For>
      </div>
    </>
  );
}
