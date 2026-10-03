import {Accessor, Show} from 'solid-js';
import ValidationMessagesList from '~/components/validation/ValidationMessagesList';
import {type LoadSaveResult} from '~/components/LoadSaveSection';
import {displayRouteErrorsTitle, displayRouteFileInputLabel, displayRouteWarningsTitle} from '~/messages/displayRouteMessages';

interface LoadSaveResultSectionProps {
  result: Accessor<LoadSaveResult | null>;
}

export default function LoadSaveResultSection(props: LoadSaveResultSectionProps) {
  return (
    <Show when={props.result()}>
      {(result) => (
        <>
          <p>{displayRouteFileInputLabel}<code data-testid="display-file-name">{result().fileName}</code></p>
          <Show when={result().warnings.length > 0}>
            <ValidationMessagesList title={displayRouteWarningsTitle} testId="display-warnings" severity="warning" messages={result().warnings}/>
          </Show>
          <Show when={result().errors.length > 0}>
            <ValidationMessagesList title={displayRouteErrorsTitle} testId="display-errors" severity="danger" messages={result().errors}/>
          </Show>
        </>
      )}
    </Show>
  );
}
