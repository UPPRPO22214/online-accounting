import type { FinNote } from '@/pages/AccountPage/ui/AccountPage';
import { createWrappedStore } from '@/shared/store';

const NEW_NOTE: FinNote = {
  id: crypto.randomUUID(),
  name: '',
  value: 0,
  date: new Date(),
};

type FinDialogStoreType = {
  opened: boolean;
  note: FinNote;

  actions: {
    open: (note: FinNote | 'new') => void;
    close: () => void;
  };
};

export const useFinDialogStore = createWrappedStore<FinDialogStoreType>(
  (mutate) => ({
    opened: false,
    note: NEW_NOTE,

    actions: {
      open: (note) =>
        mutate((state) => {
          state.opened = true;
          state.note = note === 'new' ? NEW_NOTE : note;
        }),
      close: () =>
        mutate((state) => {
          state.opened = false;
        }),
    },
  }),
);
