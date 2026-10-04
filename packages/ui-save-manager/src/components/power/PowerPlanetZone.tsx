import {For, Show} from 'solid-js';
import {PlanetPowerZoneViewModel} from 'core-mapping/display/presentation/viewModels/PlanetPowerZoneViewModel';
import {NotificationViewModel} from 'core-mapping/display/presentation/viewModels/NotificationViewModel';
import Notification from '~/components/structure/Notification';
import PowerFigureTiles from '~/components/power/PowerFigureTiles';
import PowerOptimizersTable from '~/components/power/PowerOptimizersTable';
import PowerBreakdownTable from '~/components/power/PowerBreakdownTable';
import PowerBarsChart from '~/components/power/PowerBarsChart';
import PowerDisplayFormSelect from '~/components/power/PowerDisplayFormSelect';
import {usePowerDisplayForm} from '~/hooks/usePowerDisplayForm';

interface PowerPlanetZoneProps {
  zone: PlanetPowerZoneViewModel;
  notifications: NotificationViewModel[];
}

export default function PowerPlanetZone(props: PowerPlanetZoneProps) {
  const displayForm = usePowerDisplayForm();
  return (
    <div class="power-planet-zone">
      <h4 data-testid="power-planet-title">{props.zone.planetName}</h4>
      <For each={props.notifications}>
        {(notification, index) => <Notification severity={notification.severity} testId={`power-notification-${index()}`}>{notification.message}</Notification>}
      </For>
      <PowerFigureTiles zone={props.zone}/>
      <PowerOptimizersTable optimizers={props.zone.optimizers}/>
      <div class="power-breakdown-header">
        <PowerDisplayFormSelect/>
        <p class="power-breakdown-summary" data-testid="power-breakdown-summary">{props.zone.breakdownSummary}</p>
      </div>
      <Show when={displayForm.form() === 'bars'} fallback={
        <div class="power-breakdown-tables">
          <PowerBreakdownTable table={props.zone.producers} testId="power-producers"/>
          <PowerBreakdownTable table={props.zone.consumers} testId="power-consumers"/>
        </div>
      }>
        <PowerBarsChart chart={props.zone.chart}/>
      </Show>
    </div>
  );
}
