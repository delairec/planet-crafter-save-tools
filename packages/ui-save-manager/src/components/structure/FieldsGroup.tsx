import {Accessor, For} from "solid-js";
import {TableViewModel} from "core-mapping/display/presentation/viewModels/TableViewModel";

export type ColumnViewModel = TableViewModel['columns'][number];

interface FieldsGroupProps {
  columns: Accessor<ColumnViewModel[]>,
  testId?: string,
}

export default function FieldsGroup(props: FieldsGroupProps) {

  return (
    <div class="fields-group readonly mb-2">
      <For each={props.columns()}>
        {(column, columnIndex) => (
          <div class="field" data-testid={props.testId && `${props.testId}-field-${columnIndex()}`}>
            <div class="label">{column.header}</div>
            <For each={column.values}>
              {(value, valueIndex) => (
                <div class="value" data-testid={props.testId && `${props.testId}-field-${columnIndex()}-value-${valueIndex()}`}>{value}</div>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}
