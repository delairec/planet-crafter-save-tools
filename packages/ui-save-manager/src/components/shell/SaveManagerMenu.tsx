import {Show} from 'solid-js';
import {A, useNavigate} from '@solidjs/router';
import MenuGroup from '~/components/shell/MenuGroup';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {
  configurationPath,
  loadAnotherSavePath,
  mergeTwoSavesPath,
  overviewPath,
  playersPath,
  powerPath,
  terraformationPath
} from '~/lib/pagePaths';
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
        <a href={mergeTwoSavesPath}>{mergeTwoSavesPageTitle}</a>
        <a href={loadAnotherSavePath}>{loadAnotherSavePageTitle}</a>
      </MenuGroup>
      <Show when={loadedSave.isSaveLoaded()}>
        <MenuGroup title={saveGroupTitle}>
          <A href={overviewPath} end>{overviewPageTitle}</A>
          <A href={configurationPath}>{configurationPageTitle}</A>
          <A href={powerPath}>{powerPageTitle}</A>
          <A href={terraformationPath}>{terraformationPageTitle}</A>
        </MenuGroup>
        <MenuGroup title={playersGroupTitle}>
          <button onClick={() => navigate(playersPath)}>{seeMorePlayersButtonLabel}</button>
        </MenuGroup>
      </Show>
    </nav>
  );
}
