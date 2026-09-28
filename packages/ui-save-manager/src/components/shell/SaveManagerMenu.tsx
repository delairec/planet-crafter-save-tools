import {Show} from 'solid-js';
import {A, useNavigate} from '@solidjs/router';
import MenuGroup from '~/components/shell/MenuGroup';
import PlayersMenu from '~/components/shell/PlayersMenu';
import SaveIdentity from '~/components/shell/SaveIdentity';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {PAGE_PATHS} from '~/lib/pagePaths';
import {
  configurationPageTitle,
  menuLabel,
  mergeTwoSavesPageTitle,
  overviewPageTitle,
  playersGroupTitle,
  powerPageTitle,
  resolveLoadSavePageTitle,
  saveGroupTitle,
  seeMorePlayersButtonLabel,
  terraformationPageTitle,
  toolsGroupTitle
} from '~/messages/shellMessages';

export default function SaveManagerMenu() {
  const loadedSave = useLoadedSave();
  const navigate = useNavigate();

  return (
    <nav class="menu" aria-label={menuLabel} data-testid="page-navigation">
      <MenuGroup title={toolsGroupTitle} testId="tools-pages">
        <A href={PAGE_PATHS.mergeTwoSavesPath} data-testid="merge-two-saves-page-link">{mergeTwoSavesPageTitle}</A>
        <A href={PAGE_PATHS.loadSavePath} data-testid="load-save-page-link">{resolveLoadSavePageTitle(loadedSave.isSaveLoaded())}</A>
      </MenuGroup>
      <Show when={loadedSave.isSaveLoaded()}>
        <Show when={loadedSave.viewModels.saveIdentity()}>
          {(saveIdentity) => <SaveIdentity saveIdentity={saveIdentity()}/>}
        </Show>
        <MenuGroup title={saveGroupTitle} testId="save-pages">
          <A href={PAGE_PATHS.overviewPath} end data-testid="overview-page-link">{overviewPageTitle}</A>
          <A href={PAGE_PATHS.configurationPath} data-testid="configuration-page-link">{configurationPageTitle}</A>
          <A href={PAGE_PATHS.powerPath} data-testid="power-page-link">{powerPageTitle}</A>
          <A href={PAGE_PATHS.terraformationPath} data-testid="terraformation-page-link">{terraformationPageTitle}</A>
        </MenuGroup>
        <MenuGroup title={playersGroupTitle} testId="players-pages">
          <Show when={loadedSave.viewModels.playersMenu()}>
            {(playersMenu) => <PlayersMenu playersMenu={playersMenu()}/>}
          </Show>
          <button data-testid="more-players" onClick={() => navigate(PAGE_PATHS.playersPath)}>{seeMorePlayersButtonLabel}</button>
        </MenuGroup>
      </Show>
    </nav>
  );
}
