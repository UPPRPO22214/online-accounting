import type { HandlersTransactionResponse } from '@/shared/api';
import { createWrappedStore } from '@/shared/store';

const NEW_OPERATION: Omit<HandlersTransactionResponse, 'id'> = {
  occurred_at: new Date().toDateString(),
  amount: '0',
  title: '',
};

type OpeartionFormMode = 'show' | 'edit' | 'create';

type OperationDialogStoreType = {
  opened: boolean;
  mode: OpeartionFormMode;
  operation: HandlersTransactionResponse;

  open: (operation: HandlersTransactionResponse) => void;
  openNew: () => void;
  close: () => void;
  setMode: (mode: OpeartionFormMode) => void;
};

export const useOperationDialogStore =
  createWrappedStore<OperationDialogStoreType>(
    (mutate) => ({
      opened: false,
      mode: 'create',
      operation: { ...NEW_OPERATION },

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
    { name: 'operation-dialog' },
  );
