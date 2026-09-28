import {Show} from "solid-js";
import SavePage from '~/components/shell/SavePage';
import SectionTitle from '~/components/structure/SectionTitle';
import SectionState from '~/components/structure/SectionState';
import ProgressionCard from '~/components/configuration/ProgressionCard';
import ModifiersCard from '~/components/configuration/ModifiersCard';
import UnlocksCard from '~/components/configuration/UnlocksCard';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {configurationPageTitle, saveGroupTitle} from '~/messages/shellMessages';

export default function ConfigurationPage() {
  const loadedSave = useLoadedSave();

  return (
    <SavePage group={saveGroupTitle} page={configurationPageTitle}>
      <SectionTitle testId="configuration-title">{configurationPageTitle}</SectionTitle>
      <SectionState title={configurationPageTitle} resource={loadedSave.viewModels.configurationPage}>
        {(configurationPage) => (
          <div class="configuration-cards">
            <ProgressionCard progression={configurationPage().progression}/>
            <Show when={configurationPage().modifiers}>
              {(modifiers) => <ModifiersCard modifiers={modifiers()}/>}
            </Show>
            <Show when={configurationPage().unlocks}>
              {(unlocks) => <UnlocksCard unlocks={unlocks()}/>}
            </Show>
          </div>
        )}
      </SectionState>
    </SavePage>
  );
}
