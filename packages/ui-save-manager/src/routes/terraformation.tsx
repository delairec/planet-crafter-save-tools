import {createSignal, Show} from 'solid-js';
import SavePage from '~/components/shell/SavePage';
import SectionTitle from '~/components/structure/SectionTitle';
import SectionState from '~/components/structure/SectionState';
import PlanetTabs from '~/components/structure/PlanetTabs';
import TerraformationPlanetZone from '~/components/terraformation/TerraformationPlanetZone';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {saveGroupTitle, terraformationPageTitle} from '~/messages/shellMessages';
import {terraformationPlanetTabsLabel, terraformationSectionTitle} from '~/messages/terraformationPageMessages';

const TERRAFORMATION_PANEL_ID = 'terraformation-planet-panel';
const TERRAFORMATION_TAB_ID_PREFIX = 'terraformation-planet-tab-';

export default function TerraformationPage() {
  const loadedSave = useLoadedSave();
  const [selectedPlanetIndex, setSelectedPlanetIndex] = createSignal(0);
  const selectedPlanetName = () => {
    const terraformationPage = loadedSave.viewModels.terraformationPage;
    return terraformationPage.state === 'ready' ? terraformationPage().planets[selectedPlanetIndex()]?.planetName : undefined;
  };

  return (
    <SavePage group={saveGroupTitle} page={terraformationPageTitle} subject={selectedPlanetName()}>
      <SectionState title={terraformationSectionTitle} resource={loadedSave.viewModels.terraformationPage}>
        {(terraformationPage) => (<>
          <SectionTitle testId="terraformation-title" aside={
            <Show when={terraformationPage().planets.length}>
              <PlanetTabs
                planetNames={terraformationPage().planets.map((planet) => planet.planetName)}
                selectedIndex={selectedPlanetIndex()}
                onSelect={setSelectedPlanetIndex}
                panelId={TERRAFORMATION_PANEL_ID}
                testIdPrefix={TERRAFORMATION_TAB_ID_PREFIX}
                label={terraformationPlanetTabsLabel}
              />
            </Show>
          }>{terraformationSectionTitle}</SectionTitle>
          <Show when={terraformationPage().planets[selectedPlanetIndex()]}>
            {(zone) => (
              <div role="tabpanel" id={TERRAFORMATION_PANEL_ID} aria-labelledby={`${TERRAFORMATION_TAB_ID_PREFIX}${selectedPlanetIndex()}`}>
                <TerraformationPlanetZone zone={zone()}/>
              </div>
            )}
          </Show>
        </>)}
      </SectionState>
    </SavePage>
  );
}
