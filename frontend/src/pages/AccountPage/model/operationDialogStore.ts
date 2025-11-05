import type { Operation } from '@/entities/Operation';
import { createWrappedStore } from '@/shared/store';

const NEW_OPERATION: Operation = {
  id: crypto.randomUUID(),
  date: new Date(),
  amount: 0,
  description: ''
};

type FinDialogStoreType = {
  opened: boolean;
  operation: Operation;

  open: (operation: Operation | 'new') => void;
  close: () => void;
};

export const useOperationDialogStore = createWrappedStore<FinDialogStoreType>(
  (mutate) => ({
    opened: false,
    operation: NEW_OPERATION,

    open: (operation) =>
      mutate((state) => {
        state.opened = true;
        state.operation = operation === 'new' ? NEW_OPERATION : operation;
      }),
    close: () =>
      mutate((state) => {
        state.opened = false;
      }),
  }),
);
