import {A} from '@solidjs/router';
import {Show} from 'solid-js';
import SaveIdentity from '~/components/shell/SaveIdentity';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {PAGE_PATHS} from '~/lib/pagePaths';
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
      <p data-testid="home-page-description">{homePageDescription}</p>
      <p class="home-page-links">
        <A href={PAGE_PATHS.mergeTwoSavesPath} class="button-link" data-testid="home-merge-two-saves-page-link">{mergeTwoSavesPageTitle}</A>
        <A href={PAGE_PATHS.loadSavePath} class="button-link" data-testid="home-load-save-page-link">{resolveLoadSavePageTitle(loadedSave.isSaveLoaded())}</A>
      </p>
      <Show when={loadedSave.isSaveLoaded() && loadedSave.viewModels.saveIdentity()}>
        {(saveIdentity) => (
          <SaveIdentity saveIdentity={saveIdentity()} testId="home-loaded-save">
            <A href={PAGE_PATHS.overviewPath} class="button-link button-link-neon-pink" data-testid="home-overview-link">{openOverviewLinkLabel}</A>
          </SaveIdentity>
        )}
      </Show>
    </section>
  );
}
