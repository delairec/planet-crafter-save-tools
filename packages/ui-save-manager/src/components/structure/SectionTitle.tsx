import {JSX} from 'solid-js';

interface SectionTitleProps {
  children: JSX.Element;
  testId: string;
}

export default function SectionTitle(props: SectionTitleProps) {
  return <h3 data-testid={props.testId}>{props.children}</h3>;
}
