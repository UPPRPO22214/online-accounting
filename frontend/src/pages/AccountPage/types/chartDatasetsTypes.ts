import type { OperationStatData } from '@/entities/Operation';
import { isoDateToDate } from '@/shared/types';

type ChartVariants = 'accumulate' | 'separate';

type OperationsChartDatasetDraft = {
  date: string[];
  income: number[];
  outcome: number[];
};

export type ChartsDatasets = Record<ChartVariants, OperationsChartDatasetDraft>;

export const getChartDataset = (
  operations: OperationStatData[],
  variant: ChartVariants,
) => {
  if (operations.length === 0) return;
  const preData: OperationsChartDatasetDraft = {
    date: [],
    income: [],
    outcome: [],
  };
  for (const operation of operations) {
    if (operation.amount === 0) continue;

    const opDate = isoDateToDate
      .decode(operation.date.split('T')[0])
      .toLocaleDateString();

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
  return preData;
};
