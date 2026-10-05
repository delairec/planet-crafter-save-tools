import {createSignal, createUniqueId, Show} from 'solid-js';
import {A, useNavigate} from '@solidjs/router';
import ApplicationTitle from '~/components/shell/ApplicationTitle';
import FoldableMenu from '~/components/shell/FoldableMenu';
import MenuGroup from '~/components/shell/MenuGroup';
import PlayersMenu from '~/components/shell/PlayersMenu';
import SaveIdentity from '~/components/shell/SaveIdentity';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {PAGE_PATHS} from '~/lib/pagePaths';
import {appNameHighlight, appNameLead} from '~/messages/appMessages';
import {
  configurationPageTitle,
  menuButtonLabel,
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
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const menuDialogId = createUniqueId();
  let menuButton!: HTMLButtonElement;

  function closeTheMenu() {
    if (isMenuOpen()) {
      setIsMenuOpen(false);
      menuButton.focus();
    }
  }

  function closeOnPageChoice(event: MouseEvent) {
    if (event.target instanceof Element && event.target.closest('a, button')) {
      closeTheMenu();
    }
  }

  return (
    <div class="menu">
      <header class="menu-header">
        <ApplicationTitle class="menu-application-title">
          {appNameLead} <span class="menu-application-title-highlight">{appNameHighlight}</span>
        </ApplicationTitle>
      </header>
      <FoldableMenu id={menuDialogId} isOpen={isMenuOpen()} onClose={closeTheMenu}>
        <nav class="menu-navigation" aria-label={menuLabel} data-testid="page-navigation" onClick={closeOnPageChoice}>
          <MenuGroup title={toolsGroupTitle} testId="tools-pages">
            <A href={PAGE_PATHS.mergeTwoSavesPath} data-testid="merge-two-saves-page-link">{mergeTwoSavesPageTitle}</A>
            <A href={PAGE_PATHS.loadSavePath} data-testid="load-save-page-link">{resolveLoadSavePageTitle(loadedSave.isSaveLoaded())}</A>
          </MenuGroup>
          <Show when={loadedSave.isSaveLoaded()}>
            <Show when={loadedSave.viewModels.saveIdentity()}>
              {(saveIdentity) => <SaveIdentity saveIdentity={saveIdentity()} testId="save-identity"/>}
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
      </FoldableMenu>
      <button ref={menuButton} type="button" class="menu-button" aria-expanded={isMenuOpen()} aria-controls={menuDialogId}
              data-testid="menu-button" onClick={() => setIsMenuOpen(true)}>{menuButtonLabel}</button>
    </div>
  );
}
