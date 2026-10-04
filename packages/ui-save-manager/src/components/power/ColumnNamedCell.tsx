import {JSX} from 'solid-js';

interface ColumnNamedCellProps {
  column: string;
  testId: string;
  class?: string;
  children: JSX.Element;
}

export default function ColumnNamedCell(props: ColumnNamedCellProps) {
  return (
    <td class={props.class} data-testid={props.testId}>
      <span class="power-table-column" aria-hidden="true" data-testid={`${props.testId}-column`}>{props.column}</span>
      {props.children}
    </td>
  );
}
