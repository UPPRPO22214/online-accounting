import type { Operation } from '@/entities/Operation';
import { createWrappedStore } from '@/shared/store';

const NEW_OPERATION: Operation = {
  id: crypto.randomUUID(),
  date: new Date(),
  amount: 0,
  description: '',
};

type OperationDialogMode = 'show' | 'edit';

type FinDialogStoreType = {
  opened: boolean;
  isNew: boolean;
  mode: OperationDialogMode;
  operation: Operation;

  open: (operation: Operation) => void;
  openNew: () => void;
  close: () => void;
  setMode: (mode: OperationDialogMode) => void;
};

export const useOperationDialogStore = createWrappedStore<FinDialogStoreType>(
  (mutate) => ({
    opened: false,
    isNew: true,
    mode: 'show',
    operation: NEW_OPERATION,

    open: (operation) =>
      mutate((state) => {
        state.opened = true;
        state.isNew = false;
        state.operation = operation;
      }),
    openNew: () =>
      mutate((state) => {
        state.opened = true;
        state.isNew = true;
        state.operation = { ...NEW_OPERATION };
      }),
    close: () =>
      mutate((state) => {
        state.opened = false;
      }),
    setMode: (mode) =>
      mutate((state) => {
        state.mode = mode;
      }),
  }),
);
