import { create } from 'zustand';

type AuthStoreType = {
  username: string;
  authorized: boolean;

  actions: {
    login: () => void;
    logout: () => void;
  };
};

export const useAuth = create<AuthStoreType>((set) => ({
  username: 'Чубайс',
  authorized: false,

  actions: {
    login: () => set({ authorized: true }),
    logout: () => set({ authorized: false }),
  },
}));
