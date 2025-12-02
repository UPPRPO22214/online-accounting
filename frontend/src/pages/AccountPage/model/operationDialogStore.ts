import type { Operation } from '@/entities/Operation';
import { createWrappedStore } from '@/shared/store';

const NEW_OPERATION: Omit<Operation, 'id'> = {
  date: new Date().toDateString(),
  amount: 0,
  description: '',
};

type OpeartionFormMode = 'show' | 'edit' | 'create';

type OperationDialogStoreType = {
  opened: boolean;
  mode: OpeartionFormMode;
  operation: Operation;

  open: (operation: Operation) => void;
  openNew: () => void;
  close: () => void;
  setMode: (mode: OpeartionFormMode) => void;
};

export const useOperationDialogStore =
  createWrappedStore<OperationDialogStoreType>(
    (mutate) => ({
      opened: false,
      mode: 'create',
      operation: { ...NEW_OPERATION, id: crypto.randomUUID() },

      open: (operation) =>
        mutate((state) => {
          state.opened = true;
          state.mode = 'show';
          state.operation = operation;
        }),
      openNew: () =>
        mutate((state) => {
          state.opened = true;
          state.mode = 'create';
          state.operation = { ...NEW_OPERATION, id: crypto.randomUUID() };
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
    { name: 'operation-dialog' },
  );
