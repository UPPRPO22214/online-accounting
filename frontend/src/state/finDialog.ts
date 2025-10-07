import type { FinNote } from '@/pages/AccountPage';
import { create } from 'zustand';

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

export const useFinDialog = create<FinDialogStoreType>((set) => ({
  opened: false,
  note: NEW_NOTE,

  actions: {
    open: (note) => {
      set({ opened: true, note: note === 'new' ? NEW_NOTE : note });
    },
    close: () => {
      set({ opened: false })
    }
  },
}));
