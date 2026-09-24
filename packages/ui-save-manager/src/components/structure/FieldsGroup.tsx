import {Accessor, For, Show} from "solid-js";
import Icon from "~/components/Icon";
import {TableViewModel} from "core-mapping/presentation/viewModels/TableViewModel";

export type ColumnViewModel = TableViewModel['columns'][number];

interface FieldsGroupProps {
  columns: Accessor<ColumnViewModel[]>,
}

export default function FieldsGroup(props: FieldsGroupProps) {

  return (
    <div class="fields-group readonly mb-2">
      <For each={props.columns()}>
        {(column) => (
          <div class="field">
            <div class="label">{column.header}</div>
            <For each={column.values}>
              {(value) => (
                <div class="value">
                  <Show when={column.annotation} fallback={value}>
                    {(annotation) => (
                      <>{value} <Icon content={annotation().icon}/> {annotation().label}</>
                    )}
                  </Show>
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}
