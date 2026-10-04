import {For} from 'solid-js';
import {powerPageTitle, terraformationPageTitle} from '~/messages/shellMessages';
import {planetViewTabsLabel} from '~/messages/planetPageMessages';

export type PlanetView = 'power' | 'terraformation';

interface PlanetViewTab {
  view: PlanetView;
  label: string;
}

const PLANET_VIEW_TABS: PlanetViewTab[] = [
  {view: 'power', label: powerPageTitle},
  {view: 'terraformation', label: terraformationPageTitle}
];

interface PlanetViewMenuProps {
  selectedView: PlanetView;
  onSelect: (view: PlanetView) => void;
  panelId: string;
  tabIdPrefix: string;
}

export default function PlanetViewMenu(props: PlanetViewMenuProps) {
  return (
    <div class="planet-tabs" role="tablist" aria-label={planetViewTabsLabel}>
      <For each={PLANET_VIEW_TABS}>
        {(tab) => (
          <button
            type="button"
            role="tab"
            class="planet-tab"
            id={`${props.tabIdPrefix}${tab.view}`}
            aria-selected={tab.view === props.selectedView}
            aria-controls={props.panelId}
            data-testid={`${props.tabIdPrefix}${tab.view}`}
            onClick={() => props.onSelect(tab.view)}
          >
            {tab.label}
          </button>
        )}
      </For>
    </div>
  );
}
