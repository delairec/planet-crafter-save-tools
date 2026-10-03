import {createSignal, For, Show} from 'solid-js';
import SavePage from '~/components/shell/SavePage';
import SectionTitle from '~/components/structure/SectionTitle';
import SectionState from '~/components/structure/SectionState';
import Notification from '~/components/structure/Notification';
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
              <div class="power-planet-tabs" role="tablist" aria-label={powerPlanetTabsLabel}>
                <For each={powerPage().planets}>
                  {(planet, index) => (
                    <button
                      type="button"
                      role="tab"
                      class="power-planet-tab"
                      id={`power-planet-tab-${index()}`}
                      aria-selected={index() === selectedPlanetIndex()}
                      aria-controls={POWER_PANEL_ID}
                      data-testid={`power-planet-tab-${index()}`}
                      onClick={() => setSelectedPlanetIndex(index())}
                    >
                      {planet.planetName}
                    </button>
                  )}
                </For>
              </div>
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
