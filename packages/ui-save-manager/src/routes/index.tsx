import {A} from '@solidjs/router';
import {Show} from 'solid-js';
import SaveIdentity from '~/components/shell/SaveIdentity';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {PAGE_PATHS} from '~/lib/pagePaths';
import {appName} from '~/messages/appMessages';
import {
  homePageDescription,
  mergeTwoSavesPageTitle,
  openOverviewLinkLabel,
  resolveLoadSavePageTitle
} from '~/messages/shellMessages';

export default function HomePage() {
  const loadedSave = useLoadedSave();

  return (
    <section class="home-page" data-testid="home-page">
      <h2 data-testid="home-page-title">{appName}</h2>
      <p data-testid="home-page-description">{homePageDescription}</p>
      <p class="home-page-links">
        <A href={PAGE_PATHS.mergeTwoSavesPath} data-testid="home-merge-two-saves-page-link">{mergeTwoSavesPageTitle}</A>
        <A href={PAGE_PATHS.loadSavePath} data-testid="home-load-save-page-link">{resolveLoadSavePageTitle(loadedSave.isSaveLoaded())}</A>
      </p>
      <Show when={loadedSave.isSaveLoaded() && loadedSave.viewModels.saveIdentity()}>
        {(saveIdentity) => (
          <SaveIdentity saveIdentity={saveIdentity()} testId="home-loaded-save">
            <A href={PAGE_PATHS.overviewPath} data-testid="home-overview-link">{openOverviewLinkLabel}</A>
          </SaveIdentity>
        )}
      </Show>
    </section>
  );
}
