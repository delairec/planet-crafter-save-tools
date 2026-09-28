import {A, Navigate} from '@solidjs/router';
import {Show} from 'solid-js';
import {
  configurationPageTitle,
  powerPageTitle,
  resolveLoadedSaveTitle,
  terraformationPageTitle
} from "~/messages/shellMessages";
import {displayRouteWarningsTitle} from "~/messages/displayRouteMessages";
import ValidationMessagesList from "~/components/validation/ValidationMessagesList";
import {useLoadedSave} from "~/hooks/useLoadedSave.ts";
import {PAGE_PATHS} from "~/lib/pagePaths";

export default function OverviewPage() {
  const {validatedSave, warnings} = useLoadedSave();

  return (
    <Show when={validatedSave()} fallback={<Navigate href={PAGE_PATHS.loadSavePath}/>}>
      {(loadedSave) => (
        <>
          <Show when={warnings().length}>
            <code>{loadedSave().fileName}</code>
            <ValidationMessagesList title={displayRouteWarningsTitle} testId="display-warnings" severity="warning" messages={warnings()}/>
          </Show>

          <h3 data-testid="loaded-save-title">{resolveLoadedSaveTitle(loadedSave().fileName)}</h3>
          <p class="overview-pages">
            <A href={PAGE_PATHS.configurationPath} data-testid="overview-configuration-page-link">{configurationPageTitle}</A>
            <A href={PAGE_PATHS.powerPath} data-testid="overview-power-page-link">{powerPageTitle}</A>
            <A href={PAGE_PATHS.terraformationPath} data-testid="overview-terraformation-page-link">{terraformationPageTitle}</A>
          </p>
        </>
      )}
    </Show>
  );
}
