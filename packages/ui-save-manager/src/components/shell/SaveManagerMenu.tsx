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
    <nav class="menu" aria-label={menuLabel} data-testid="menu">
      <MenuGroup title={toolsGroupTitle} testId="tools-menu-group">
        <a href={PAGE_PATHS.mergeTwoSavesPath} data-testid="menu-page-link">{mergeTwoSavesPageTitle}</a>
        <a href={PAGE_PATHS.loadAnotherSavePath} data-testid="menu-page-link">{loadAnotherSavePageTitle}</a>
      </MenuGroup>
      <Show when={loadedSave.isSaveLoaded()}>
        <Show when={loadedSave.viewModels.saveIdentity()}>
          {(saveIdentity) => <SaveIdentity saveIdentity={saveIdentity()}/>}
        </Show>
        <MenuGroup title={saveGroupTitle} testId="save-menu-group">
          <A href={PAGE_PATHS.overviewPath} end data-testid="menu-page-link">{overviewPageTitle}</A>
          <A href={PAGE_PATHS.configurationPath} data-testid="menu-page-link">{configurationPageTitle}</A>
          <A href={PAGE_PATHS.powerPath} data-testid="menu-page-link">{powerPageTitle}</A>
          <A href={PAGE_PATHS.terraformationPath} data-testid="menu-page-link">{terraformationPageTitle}</A>
        </MenuGroup>
        <MenuGroup title={playersGroupTitle} testId="players-menu-group">
          <Show when={loadedSave.viewModels.playersMenu()}>
            {(playersMenu) => <PlayersMenu playersMenu={playersMenu()}/>}
          </Show>
          <button data-testid="see-more-players-button" onClick={() => navigate(PAGE_PATHS.playersPath)}>{seeMorePlayersButtonLabel}</button>
        </MenuGroup>
      </Show>
    </nav>
  );
}
