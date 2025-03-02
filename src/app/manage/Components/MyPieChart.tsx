import * as echarts from 'echarts/core';
import { useEffect, useRef } from 'react';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsOption, ECharts } from 'echarts';

const defaultOption = {
  tooltip: {
    trigger: 'item',
  },
  legend: {
    top: '5%',
    left: 'center',
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 40,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
    },
  ],
};

echarts.use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer, LabelLayout]);

interface MyPieChartProps<T> {
  options?: EChartsOption;
  data?: T[];
  style?: React.CSSProperties;
}

export default function MyPieChart<T>(props: MyPieChartProps<T>) {
  const { options, data, style } = props;
  const ref = useRef(null);
  const myChart = useRef<ECharts | null>(null);

  useEffect(() => {
    // init chart
    if (!myChart.current) {
      // @ts-expect-error ref.current is HTMLElement
      myChart.current = echarts.init(ref.current);
    }
  }, []);

  // update chart
  useEffect(() => {
    if (!myChart.current) return;
    myChart.current.setOption(options || defaultOption);
  }, [options]);

  useEffect(() => {
    if (!myChart.current || !data) return;
    myChart.current.appendData({
      seriesIndex: 0,
      data,
    });
    return () => {
      if (myChart.current) myChart.current.dispose();
    };
  }, [data]);

  return <div style={style} ref={ref} />;
}
