import type { HandlersTransactionResponse } from '@/shared/api';
import { createWrappedStore } from '@/shared/store';

export type StretchedOperation = Pick<
  HandlersTransactionResponse,
  'amount' | 'id' | 'occurred_at' | 'title' | 'user_id' | 'period'
>;

const NEW_OPERATION: StretchedOperation = {
  occurred_at: new Date().toDateString(),
  amount: 0,
  title: '',
  id: 0,
  user_id: 0,
};

type OpeartionFormMode = 'show' | 'edit' | 'create';

type OperationDialogStoreType = {
  opened: boolean;
  mode: OpeartionFormMode;
  operation: StretchedOperation;

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
