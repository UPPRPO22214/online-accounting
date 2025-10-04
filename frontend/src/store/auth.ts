import { create } from 'zustand';

type AuthStoreType = {
  username: string;
  authorized: boolean;

  login: () => void;
  logout: () => void;
};

export const useAuth = create<AuthStoreType>((set, get) => ({
  username: 'Чубайс',
  authorized: false,

  login: () => set({ authorized: true }),
  logout: () => set({ authorized: false }),
}));
