import {For, Show} from 'solid-js';
import {PlanetPowerTabViewModel} from 'core-mapping/display/presentation/viewModels/PlanetPageViewModel';
import Notification from '~/components/structure/Notification';
import PowerPlanetZone from '~/components/power/PowerPlanetZone';

interface PlanetPowerTabProps {
  tab: PlanetPowerTabViewModel;
}

export default function PlanetPowerTab(props: PlanetPowerTabProps) {
  return (
    <Show when={props.tab.zone} fallback={<>
      <For each={props.tab.notifications}>
        {(notification, index) => <Notification severity={notification.severity} testId={`power-notification-${index()}`}>{notification.message}</Notification>}
      </For>
      <p class="planet-absent-zone" data-testid="planet-power-absent">{props.tab.absentZone}</p>
    </>}>
      {(zone) => <PowerPlanetZone zone={zone()} notifications={props.tab.notifications}/>}
    </Show>
  );
}
