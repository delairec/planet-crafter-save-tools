import {JSX, Show} from 'solid-js';

interface SectionTitleProps {
  children: JSX.Element;
  testId: string;
  hint?: string;
}

export default function SectionTitle(props: SectionTitleProps) {
  return (
    <div class="section-title">
      <h3 data-testid={props.testId}>{props.children}</h3>
      <Show when={props.hint}>
        {(hint) => <span class="section-title-hint" data-testid={`${props.testId}-hint`}>{hint()}</span>}
      </Show>
    </div>
  );
}
