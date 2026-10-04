import {For} from 'solid-js';

interface PlanetTabsProps {
  planetNames: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  panelId: string;
  testIdPrefix: string;
  label: string;
}

export default function PlanetTabs(props: PlanetTabsProps) {
  return (
    <div class="planet-tabs" role="tablist" aria-label={props.label}>
      <For each={props.planetNames}>
        {(planetName, index) => (
          <button
            type="button"
            role="tab"
            class="planet-tab"
            id={`${props.testIdPrefix}${index()}`}
            aria-selected={index() === props.selectedIndex}
            aria-controls={props.panelId}
            data-testid={`${props.testIdPrefix}${index()}`}
            onClick={() => props.onSelect(index())}
          >
            {planetName}
          </button>
        )}
      </For>
    </div>
  );
}
