import {Show} from 'solid-js';
import SavePage from '~/components/shell/SavePage';
import SectionTitle from '~/components/structure/SectionTitle';
import SectionState from '~/components/structure/SectionState';
import OverviewTiles from '~/components/overview/OverviewTiles';
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
          <section class="overview-identity" aria-label={overviewPageTitle} data-testid="overview-identity">
            <SectionTitle testId="overview-identity-title" hint={overviewPage().identity.hint}>{overviewPage().identity.title}</SectionTitle>
            <OverviewTiles tiles={overviewPage().tiles}/>
          </section>
        )}
      </SectionState>
    </SavePage>
  );
}
