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
  type ChartOptions
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

import { isoDateToDate } from '@/shared/types';
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

type OperationAmountsByDate = {
  date: string[];
  income: number[];
  outcome: number[];
};

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
  const operations = useAccountOperationsStore((state) => state.operations);

  const options = useMemo(() => getOptions(title), [title]);
  const [data, setData] = useState<ChartData<typeof type>>({ datasets: [] });

  useEffect(() => {
    // TODO: покрыть тестами
    if (operations.length === 0) return;
    const preData: OperationAmountsByDate = {
      date: [],
      income: [],
      outcome: [],
    };
    for (const operation of operations) {
      if (operation.amount === 0) continue;

      const opDate = isoDateToDate.decode(operation.date).toLocaleDateString(); // TODO: надо сделать лучше (нет)

      const len = preData.date.length;
      const lastDate = preData.date.at(-1);
      if (lastDate === opDate) {
        if (operation.amount > 0) preData.income[len - 1] += operation.amount;
        else if (operation.amount < 0)
          preData.outcome[len - 1] -= operation.amount;
      } else {
        // Сразу и первый элемент добавит
        let income = 0;
        let outcome = 0;
        if (variant === 'accumulate' && lastDate !== undefined) {
          income = preData.income[len - 1];
          outcome = preData.outcome[len - 1];
        }
        income += Math.max(operation.amount, 0);
        outcome += -Math.min(operation.amount, 0);
        preData.date.push(opDate);
        preData.income.push(income);
        preData.outcome.push(outcome);
      }
    }

    const data: ChartData<typeof type> = {
      labels: preData.date,
      datasets: [
        {
          label: 'Доходы',
          data: preData.income,
          borderColor: '#7bf1a8ff',
          backgroundColor: '#7bf1a8aa',
        },
        {
          label: 'Расходы',
          data: preData.outcome,
          borderColor: '#ffa2a2ff',
          backgroundColor: '#ffa2a2aa',
        },
      ],
    };
    setData(data);
  }, [variant, type, operations]);

  return (
    <Chart type={type} title={title} data={data} options={options} {...props} />
  );
};
