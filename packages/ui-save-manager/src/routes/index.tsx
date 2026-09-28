import {A} from '@solidjs/router';
import {Show} from 'solid-js';
import SaveIdentity from '~/components/shell/SaveIdentity';
import IconButton from '~/components/structure/IconButton';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {PAGE_PATHS} from '~/lib/pagePaths';
import HomeMessageAttachments from '~/components/HomeMessageAttachments';
import {useMergedSaves} from '~/hooks/useMergedSaves';
import {
  crossIcon,
  homeMessageBody,
  homeMessageClosing,
  homeMessageSender,
  homeMessageTitle,
  mergeTwoSavesPageTitle,
  openOverviewLinkLabel,
  resolveLoadSavePageTitle,
  unloadSaveButtonLabel
} from '~/messages/shellMessages';

export default function HomePage() {
  const loadedSave = useLoadedSave();
  const mergedSaves = useMergedSaves();

  return (
    <section class="home-page" data-testid="home-page">
      <article class="home-message" aria-labelledby="home-message-title" data-testid="home-message">
        <h2 id="home-message-title" class="home-message-title" data-testid="home-message-title">{homeMessageTitle}</h2>
        <div class="home-message-envelope" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <polygon class="home-message-hexagon" points="50,4 90,27 90,73 50,96 10,73 10,27"/>
            <rect class="home-message-letter" x="24" y="32" width="52" height="36" rx="3"/>
            <polyline class="home-message-flap" points="25,34 50,54 75,34"/>
          </svg>
        </div>
        <div class="home-message-frame">
          <p class="home-message-body" data-testid="home-page-description">{homeMessageBody}</p>
          <div class="home-message-actions">
            <p class="home-page-links">
              <A href={PAGE_PATHS.mergeTwoSavesPath} class="button-link" data-testid="home-merge-two-saves-page-link">{mergeTwoSavesPageTitle}</A>
              <A href={PAGE_PATHS.loadSavePath} class="button-link" data-testid="home-load-save-page-link">{resolveLoadSavePageTitle(loadedSave.isSaveLoaded())}</A>
            </p>
            <Show when={loadedSave.isSaveLoaded() && loadedSave.viewModels.saveIdentity()}>
              {(saveIdentity) => (
                <SaveIdentity saveIdentity={saveIdentity()} testId="home-loaded-save">
                  <IconButton class="home-unload-save" icon={crossIcon} label={unloadSaveButtonLabel} testId="unload-save"
                              onClick={loadedSave.unloadSave} disabled={false}/>
                  <A href={PAGE_PATHS.overviewPath} class="button-link button-link-neon-pink" data-testid="home-overview-link">{openOverviewLinkLabel}</A>
                </SaveIdentity>
              )}
            </Show>
          </div>
          <p class="home-message-body" data-testid="home-message-closing">{homeMessageClosing}</p>
          <p class="home-message-sender" data-testid="home-message-sender">{homeMessageSender}</p>
          <HomeMessageAttachments mergedSaves={mergedSaves.keptMergedSaves} onRemove={mergedSaves.removeMergedSave}/>
        </div>
      </article>
    </section>
  );
}
