import { type OperationStatData, sortOperations } from '@/entities/Operation';
import { createWrappedStore } from '@/shared/store';
import {
  getChartDataset,
  type ChartsDatasets,
} from '../types/chartDatasetsTypes';

type AccountOperationsStoreType = {
  operations: OperationStatData[];
  totalAmount: number;
  chartsDatasets: ChartsDatasets;

  set: (operations: OperationStatData[]) => void;
};

export const useAccountOperationsStore =
  createWrappedStore<AccountOperationsStoreType>(
    (mutate) => ({
      operations: [],
      totalAmount: 0,
      chartsDatasets: {
        accumulate: {
          date: [],
          income: [],
          outcome: [],
        },
        separate: {
          date: [],
          income: [],
          outcome: [],
        },
      },

      set: (operations) =>
        mutate((state) => {
          state.operations.length = 0;
          state.operations = sortOperations(operations);
          state.totalAmount = state.operations
            .map((op) => op.amount)
            .reduce((acc, op) => acc + op, 0);
          const accDataset = getChartDataset(state.operations, 'accumulate');
          if (accDataset) state.chartsDatasets.accumulate = accDataset;
          const sepDataset = getChartDataset(state.operations, 'separate');
          if (sepDataset) state.chartsDatasets.separate = sepDataset;
        }),
    }),
    { name: 'account-operations' },
  );
