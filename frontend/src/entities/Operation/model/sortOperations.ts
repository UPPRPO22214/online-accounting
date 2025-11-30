import type { Operation } from '../types';

export const sortOperations = (operations: Operation[]) =>
  operations.toSorted((a, b) => {
    if (a.date > b.date) return 1;
    else if (a.date < b.date) return -1;
    else return 0;
  });
