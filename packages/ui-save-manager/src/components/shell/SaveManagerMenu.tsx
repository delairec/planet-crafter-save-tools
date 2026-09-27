import {For, Show} from 'solid-js';
import {A, useNavigate} from '@solidjs/router';
import MenuGroup from '~/components/shell/MenuGroup';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {PAGE_PATHS} from '~/lib/pagePaths';
import {
  configurationPageTitle,
  loadAnotherSavePageTitle,
  menuLabel,
  saveIdentityLabel,
  mergeTwoSavesPageTitle,
  overviewPageTitle,
  playersGroupTitle,
  powerPageTitle,
  saveGroupTitle,
  seeMorePlayersButtonLabel,
  terraformationPageTitle,
  toolsGroupTitle
} from '~/messages/shellMessages';

export default function SaveManagerMenu() {
  const loadedSave = useLoadedSave();
  const navigate = useNavigate();

  return (
    <nav class="menu" aria-label={menuLabel}>
      <MenuGroup title={toolsGroupTitle}>
        <a href={PAGE_PATHS.mergeTwoSavesPath}>{mergeTwoSavesPageTitle}</a>
        <a href={PAGE_PATHS.loadAnotherSavePath}>{loadAnotherSavePageTitle}</a>
      </MenuGroup>
      <Show when={loadedSave.isSaveLoaded()}>
        <Show when={loadedSave.viewModels.saveIdentity()}>
          {(saveIdentity) => (
            <section class="menu-identity" aria-label={saveIdentityLabel}>
              <p class="menu-identity-file">{saveIdentity().fileName}</p>
              <Show when={saveIdentity().displayName}>
                {(displayName) => <p class="menu-identity-detail">{displayName()}</p>}
              </Show>
              <Show when={saveIdentity().mode}>
                {(mode) => <p class="menu-identity-detail">{mode()}</p>}
              </Show>
              <Show when={saveIdentity().gameRelease}>
                {(gameRelease) => <p class="menu-identity-detail">{gameRelease()}</p>}
              </Show>
            </section>
          )}
        </Show>
        <MenuGroup title={saveGroupTitle}>
          <A href={PAGE_PATHS.overviewPath} end>{overviewPageTitle}</A>
          <A href={PAGE_PATHS.configurationPath}>{configurationPageTitle}</A>
          <A href={PAGE_PATHS.powerPath}>{powerPageTitle}</A>
          <A href={PAGE_PATHS.terraformationPath}>{terraformationPageTitle}</A>
        </MenuGroup>
        <MenuGroup title={playersGroupTitle}>
          <ul class="menu-players">
            <For each={loadedSave.viewModels.playersMenu()?.players}>
              {(player) => (
                <li class="menu-player">
                  <span class="menu-player-name">{player.name}</span>
                  <Show when={player.hostBadge}>
                    {(hostBadge) => <span class="host-badge">{hostBadge()}</span>}
                  </Show>
                  <Show when={player.planet}>
                    {(planet) => <span class="menu-player-planet">{planet()}</span>}
                  </Show>
                </li>
              )}
            </For>
          </ul>
          <button onClick={() => navigate(PAGE_PATHS.playersPath)}>{seeMorePlayersButtonLabel}</button>
        </MenuGroup>
      </Show>
    </nav>
  );
}
