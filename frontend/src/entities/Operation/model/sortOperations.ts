import type { OperationStatData } from '../types';

export const sortOperations = (operations: OperationStatData[]) =>
  operations.toSorted((a, b) => {
    if (a.date > b.date) return 1;
    else if (a.date < b.date) return -1;
    else return 0;
  });
