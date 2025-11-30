import { useEffect, useMemo, useState, type HTMLAttributes } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

import { useAccountOperationsStore } from '../model';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function getOptions(title?: string): ChartOptions {
  return {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: title,
      },
    },
  };
}

type OperationsChartProps = HTMLAttributes<HTMLCanvasElement> & {
  title: string;
  type: 'bar' | 'line';
  variant: 'accumulate' | 'separate';
};

export const OperationsChart: React.FC<OperationsChartProps> = ({
  title,
  type,
  variant,
  ...props
}) => {
  const datasets = useAccountOperationsStore((state) => state.chartsDatasets);

  const options = useMemo(() => getOptions(title), [title]);
  const [data, setData] = useState<ChartData<typeof type>>({ datasets: [] });

  useEffect(() => {
    const dataset = datasets[variant];

    const data: ChartData<typeof type> = {
      labels: dataset.date,
      datasets: [
        {
          label: 'Доходы',
          data: dataset.income,
          borderColor: '#7bf1a8ff',
          backgroundColor: '#7bf1a8aa',
        },
        {
          label: 'Расходы',
          data: dataset.outcome,
          borderColor: '#ffa2a2ff',
          backgroundColor: '#ffa2a2aa',
        },
      ],
    };
    setData(data);
  }, [variant, type, datasets]);

  return (
    <Chart type={type} title={title} data={data} options={options} {...props} />
  );
};
