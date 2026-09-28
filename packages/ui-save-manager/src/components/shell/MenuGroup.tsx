import {createUniqueId, JSX} from 'solid-js';

interface MenuGroupProps {
  title: string;
  testId: string;
  children: JSX.Element;
}

export default function MenuGroup(props: MenuGroupProps) {
  const titleId = createUniqueId();

  return (
    <div class="menu-group" role="group" aria-labelledby={titleId} data-testid={props.testId}>
      <p id={titleId} class="menu-group-title" data-testid={`${props.testId}-title`}>{props.title}</p>
      {props.children}
    </div>
  );
}
