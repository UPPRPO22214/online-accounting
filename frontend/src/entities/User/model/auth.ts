import { createWrappedStore } from '@/shared/store';
import type { User } from '../types';

type AuthStoreType = {
  user: User;
  authorized: boolean;

  login: () => void;
  logout: () => void;
};

export const useAuthStore = createWrappedStore<AuthStoreType>(
  (mutate) => ({
    user: {
      id: 1,
      email: 'some@mail.ru',
      nickname: 'Чубайс',
    },
    authorized: false,

    login: () =>
      mutate((state) => {
        state.authorized = true;
      }),
    logout: () =>
      mutate((state) => {
        state.authorized = false;
      }),
  }),
  { name: 'auth-store' },
);
