import {For} from 'solid-js';
import {OverviewPlanetCardViewModel} from 'core-mapping/display/presentation/viewModels/OverviewPageViewModel';
import OverviewPlanetCard from '~/components/overview/OverviewPlanetCard';

interface OverviewPlanetCardsProps {
  cards: OverviewPlanetCardViewModel[];
}

export default function OverviewPlanetCards(props: OverviewPlanetCardsProps) {
  return (
    <div class="overview-planet-cards">
      <For each={props.cards}>
        {(card, index) => <OverviewPlanetCard card={card} testId={`overview-planet-${index()}`}/>}
      </For>
    </div>
  );
}
