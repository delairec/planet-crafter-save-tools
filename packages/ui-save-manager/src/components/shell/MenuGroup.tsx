import {createUniqueId, JSX} from 'solid-js';

interface MenuGroupProps {
  title: string;
  children: JSX.Element;
}

export default function MenuGroup(props: MenuGroupProps) {
  const titleId = createUniqueId();

  return (
    <div class="menu-group" role="group" aria-labelledby={titleId}>
      <p id={titleId} class="menu-group-title">{props.title}</p>
      {props.children}
    </div>
  );
}
