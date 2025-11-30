import type { Operation } from '@/entities/Operation';
import { createWrappedStore } from '@/shared/store';

type AccountOperationsStoreType = {
  operations: Operation[];

  set: (operations: Operation[]) => void;
};

export const useAccountOperationsStore = createWrappedStore<AccountOperationsStoreType>(
  (mutate) => ({
    operations: [],

    set: (operations) =>
      mutate((state) => {
        state.operations.length = 0;
        state.operations = operations;
      }),
  }),
  { name: 'account-operations' }
);
