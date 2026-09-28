import {JSX, Show} from 'solid-js';

interface CardProps {
  title: string;
  summary?: string;
  children: JSX.Element;
  testId: string;
}

export default function Card(props: CardProps) {
  return (
    <div class="card">
      <div class="card-header">
        <h4 data-testid={`${props.testId}-title`}>{props.title}</h4>
        <Show when={props.summary}>
          <span class="card-summary" data-testid={`${props.testId}-summary`}>{props.summary}</span>
        </Show>
      </div>
      <div class="card-body">
        {props.children}
      </div>
    </div>
  );
}
