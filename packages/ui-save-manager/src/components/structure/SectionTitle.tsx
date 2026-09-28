import {JSX} from 'solid-js';

interface SectionTitleProps {
  children: JSX.Element;
}

export default function SectionTitle(props: SectionTitleProps) {
  return <h3>{props.children}</h3>;
}
