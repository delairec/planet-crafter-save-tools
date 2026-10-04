import {createSignal, Match, Show, Switch} from 'solid-js';
import {useSearchParams} from '@solidjs/router';
import SavePage from '~/components/shell/SavePage';
import SectionState from '~/components/structure/SectionState';
import PlanetViewMenu, {PlanetView} from '~/components/planet/PlanetViewMenu';
import PlanetPowerTab from '~/components/planet/PlanetPowerTab';
import PlanetTerraformationTab from '~/components/planet/PlanetTerraformationTab';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {PAGE_PATHS} from '~/lib/pagePaths';
import {overviewPageTitle, saveGroupTitle} from '~/messages/shellMessages';
import {planetSectionTitle} from '~/messages/planetPageMessages';

const PLANET_VIEW_PANEL_ID = 'planet-view-panel';
const PLANET_VIEW_TAB_ID_PREFIX = 'planet-view-tab-';
const NO_PLANET_IDENTIFIER = '';

export default function PlanetPage() {
  const loadedSave = useLoadedSave();
  const [searchParams] = useSearchParams<{id: string}>();
  const [selectedView, setSelectedView] = createSignal<PlanetView>('power');
  const planetPage = () => loadedSave.planetPage(searchParams.id ?? NO_PLANET_IDENTIFIER);
  const planetName = () => {
    const resource = planetPage();
    return resource.state === 'ready' && resource().planetName ? resource().planetName : undefined;
  };

  return (
    <SavePage group={saveGroupTitle} page={overviewPageTitle} pageHref={PAGE_PATHS.overviewPath} subject={planetName()}>
      <SectionState title={planetSectionTitle} resource={planetPage()}>
        {(planet) => (
          <Show when={planet().unknownPlanet} fallback={<>
            <PlanetViewMenu
              selectedView={selectedView()}
              onSelect={setSelectedView}
              panelId={PLANET_VIEW_PANEL_ID}
              tabIdPrefix={PLANET_VIEW_TAB_ID_PREFIX}
            />
            <div role="tabpanel" id={PLANET_VIEW_PANEL_ID} aria-labelledby={`${PLANET_VIEW_TAB_ID_PREFIX}${selectedView()}`}>
              <Switch>
                <Match when={selectedView() === 'power'}>
                  <PlanetPowerTab tab={planet().power}/>
                </Match>
                <Match when={selectedView() === 'terraformation'}>
                  <PlanetTerraformationTab tab={planet().terraformation}/>
                </Match>
              </Switch>
            </div>
          </>}>
            {(unknownPlanet) => <p class="planet-absent-zone" data-testid="planet-unknown">{unknownPlanet()}</p>}
          </Show>
        )}
      </SectionState>
    </SavePage>
  );
}
