import {For} from 'solid-js';
import {PlanetPowerZoneViewModel} from 'core-mapping/display/presentation/viewModels/PlanetPowerZoneViewModel';
import {NotificationViewModel} from 'core-mapping/display/presentation/viewModels/NotificationViewModel';
import ToneBadge from '~/components/structure/ToneBadge';
import Notification from '~/components/structure/Notification';
import PowerFigureTiles from '~/components/power/PowerFigureTiles';
import PowerOptimizersTable from '~/components/power/PowerOptimizersTable';
import PowerBreakdownTable from '~/components/power/PowerBreakdownTable';

interface PowerPlanetZoneProps {
  zone: PlanetPowerZoneViewModel;
  notifications: NotificationViewModel[];
}

export default function PowerPlanetZone(props: PowerPlanetZoneProps) {
  return (
    <div class="power-planet-zone">
      <h4 class="power-planet-title" data-testid="power-planet-title">
        <span data-testid="power-planet-name">{props.zone.planetName}</span>
        <ToneBadge badge={props.zone.balance} testId="power-planet-balance"/>
      </h4>
      <For each={props.notifications}>
        {(notification, index) => <Notification severity={notification.severity} testId={`power-notification-${index()}`}>{notification.message}</Notification>}
      </For>
      <PowerFigureTiles zone={props.zone}/>
      <PowerOptimizersTable optimizers={props.zone.optimizers}/>
      <p class="power-breakdown-summary" data-testid="power-breakdown-summary">{props.zone.breakdownSummary}</p>
      <div class="power-breakdown-tables">
        <PowerBreakdownTable table={props.zone.producers} testId="power-producers"/>
        <PowerBreakdownTable table={props.zone.consumers} testId="power-consumers"/>
      </div>
    </div>
  );
}
