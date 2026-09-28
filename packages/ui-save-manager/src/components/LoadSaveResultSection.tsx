import {Accessor, Show} from 'solid-js';
import ValidationMessagesList from '~/components/validation/ValidationMessagesList';
import {type LoadSaveResult} from '~/components/LoadSaveSection';
import {displayRouteErrorsTitle, displayRouteWarningsTitle} from '~/messages/displayRouteMessages';

interface LoadSaveResultSectionProps {
  result: Accessor<LoadSaveResult | null>;
}

export default function LoadSaveResultSection(props: LoadSaveResultSectionProps) {
  return (
    <Show when={props.result()}>
      {(result) => (
        <>
          <Show when={result().errors.length}>
            <code>{result().fileName}</code>
            <ValidationMessagesList title={displayRouteErrorsTitle} testId="display-errors" severity="danger" messages={result().errors}/>
          </Show>
          <Show when={result().warnings.length}>
            <code>{result().fileName}</code>
            <ValidationMessagesList title={displayRouteWarningsTitle} testId="display-warnings" severity="warning" messages={result().warnings}/>
          </Show>
        </>
      )}
    </Show>
  );
}
