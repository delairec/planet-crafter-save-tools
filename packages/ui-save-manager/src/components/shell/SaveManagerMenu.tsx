import {Show} from 'solid-js';
import {A, useNavigate} from '@solidjs/router';
import MenuGroup from '~/components/shell/MenuGroup';
import PlayersMenu from '~/components/shell/PlayersMenu';
import SaveIdentity from '~/components/shell/SaveIdentity';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {PAGE_PATHS} from '~/lib/pagePaths';
import {
  configurationPageTitle,
  loadAnotherSavePageTitle,
  menuLabel,
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
          {(saveIdentity) => <SaveIdentity saveIdentity={saveIdentity()}/>}
        </Show>
        <MenuGroup title={saveGroupTitle}>
          <A href={PAGE_PATHS.overviewPath} end>{overviewPageTitle}</A>
          <A href={PAGE_PATHS.configurationPath}>{configurationPageTitle}</A>
          <A href={PAGE_PATHS.powerPath}>{powerPageTitle}</A>
          <A href={PAGE_PATHS.terraformationPath}>{terraformationPageTitle}</A>
        </MenuGroup>
        <MenuGroup title={playersGroupTitle}>
          <Show when={loadedSave.viewModels.playersMenu()}>
            {(playersMenu) => <PlayersMenu playersMenu={playersMenu()}/>}
          </Show>
          <button onClick={() => navigate(PAGE_PATHS.playersPath)}>{seeMorePlayersButtonLabel}</button>
        </MenuGroup>
      </Show>
    </nav>
  );
}
