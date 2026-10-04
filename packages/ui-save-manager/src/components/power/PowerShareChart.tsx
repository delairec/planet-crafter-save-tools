import {PowerShareChartViewModel} from 'core-mapping/display/presentation/viewModels/PowerChartViewModel';
import PowerShareBar from '~/components/power/PowerShareBar';

interface PowerShareChartProps {
  chart: PowerShareChartViewModel;
}

export default function PowerShareChart(props: PowerShareChartProps) {
  return (
    <div class="power-share-chart">
      <PowerShareBar bar={props.chart.production} testId="power-share-production"/>
      <PowerShareBar bar={props.chart.consumption} testId="power-share-consumption"/>
    </div>
  );
}
