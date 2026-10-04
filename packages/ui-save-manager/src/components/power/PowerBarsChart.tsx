import {PowerChartViewModel} from 'core-mapping/display/presentation/viewModels/PowerChartViewModel';
import PowerChartPanel from '~/components/power/PowerChartPanel';
import PowerChartLegend from '~/components/power/PowerChartLegend';

interface PowerBarsChartProps {
  chart: PowerChartViewModel;
}

export default function PowerBarsChart(props: PowerBarsChartProps) {
  return (
    <div class="power-chart">
      <div class="power-chart-panels">
        <PowerChartPanel panel={props.chart.production} testId="power-chart-production"/>
        <PowerChartPanel panel={props.chart.consumption} testId="power-chart-consumption"/>
      </div>
      <PowerChartLegend legend={props.chart.legend}/>
    </div>
  );
}
