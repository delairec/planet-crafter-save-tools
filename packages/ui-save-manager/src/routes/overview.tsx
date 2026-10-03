import {For, Show} from 'solid-js';
import SavePage from '~/components/shell/SavePage';
import SectionTitle from '~/components/structure/SectionTitle';
import SectionState from '~/components/structure/SectionState';
import Notification from '~/components/structure/Notification';
import OverviewTiles from '~/components/overview/OverviewTiles';
import OverviewPlanetCards from '~/components/overview/OverviewPlanetCards';
import ValidationMessagesList from '~/components/validation/ValidationMessagesList';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {overviewPageTitle} from '~/messages/shellMessages';
import {displayRouteWarningsTitle} from '~/messages/displayRouteMessages';

export default function OverviewPage() {
  const loadedSave = useLoadedSave();

  return (
    <SavePage page={overviewPageTitle}>
      <Show when={loadedSave.warnings().length}>
        <ValidationMessagesList title={displayRouteWarningsTitle} testId="display-warnings" severity="warning" messages={loadedSave.warnings()}/>
      </Show>
      <SectionState title={overviewPageTitle} resource={loadedSave.viewModels.overviewPage}>
        {(overviewPage) => (
          <>
            <section class="overview-identity" aria-label={overviewPageTitle} data-testid="overview-identity">
              <SectionTitle testId="overview-identity-title" hint={overviewPage().identity.hint}>{overviewPage().identity.title}</SectionTitle>
              <For each={overviewPage().notifications}>
                {(notification, index) => <Notification severity={notification.severity} testId={`overview-notification-${index()}`}>{notification.message}</Notification>}
              </For>
              <OverviewTiles tiles={overviewPage().tiles}/>
            </section>
            <section class="overview-planets" aria-label={overviewPage().planets.title} data-testid="overview-planets">
              <SectionTitle testId="overview-planets-title" hint={overviewPage().planets.hint}>{overviewPage().planets.title}</SectionTitle>
              <OverviewPlanetCards cards={overviewPage().planets.cards}/>
            </section>
          </>
        )}
      </SectionState>
    </SavePage>
  );
}
