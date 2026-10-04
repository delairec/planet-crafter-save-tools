import {createSignal, For, Show} from 'solid-js';
import SavePage from '~/components/shell/SavePage';
import SectionTitle from '~/components/structure/SectionTitle';
import SectionState from '~/components/structure/SectionState';
import Notification from '~/components/structure/Notification';
import PlanetTabs from '~/components/structure/PlanetTabs';
import PowerPlanetZone from '~/components/power/PowerPlanetZone';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {powerPageTitle, saveGroupTitle} from '~/messages/shellMessages';
import {powerPlanetTabsLabel, powerSectionTitle} from '~/messages/powerPageMessages';

const POWER_PANEL_ID = 'power-planet-panel';

export default function PowerPage() {
  const loadedSave = useLoadedSave();
  const [selectedPlanetIndex, setSelectedPlanetIndex] = createSignal(0);
  const selectedPlanetName = () => {
    const powerPage = loadedSave.viewModels.powerPage;
    return powerPage.state === 'ready' ? powerPage().planets[selectedPlanetIndex()]?.planetName : undefined;
  };

  return (
    <SavePage group={saveGroupTitle} page={powerPageTitle} subject={selectedPlanetName()}>
      <SectionTitle testId="power-title">{powerSectionTitle}</SectionTitle>
      <SectionState title={powerSectionTitle} resource={loadedSave.viewModels.powerPage}>
        {(powerPage) => (
          <Show
            when={powerPage().planets[selectedPlanetIndex()]}
            fallback={
              <For each={powerPage().notifications}>
                {(notification, index) => <Notification severity={notification.severity} testId={`power-notification-${index()}`}>{notification.message}</Notification>}
              </For>
            }
          >
            {(zone) => (<>
              <PlanetTabs
                planetNames={powerPage().planets.map((planet) => planet.planetName)}
                selectedIndex={selectedPlanetIndex()}
                onSelect={setSelectedPlanetIndex}
                panelId={POWER_PANEL_ID}
                testIdPrefix="power-planet-tab-"
                label={powerPlanetTabsLabel}
              />
              <div role="tabpanel" id={POWER_PANEL_ID} aria-labelledby={`power-planet-tab-${selectedPlanetIndex()}`}>
                <PowerPlanetZone zone={zone()} notifications={powerPage().notifications}/>
              </div>
            </>)}
          </Show>
        )}
      </SectionState>
    </SavePage>
  );
}
