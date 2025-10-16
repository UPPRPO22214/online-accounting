import { createWrappedStore } from './misc';

type AuthStoreType = {
  username: string;
  authorized: boolean;

  actions: {
    login: () => void;
    logout: () => void;
  };
};

export const useAuth = createWrappedStore<AuthStoreType>((mutate) => ({
  username: 'Чубайс',
  authorized: false,

  actions: {
    login: () => mutate((state) => { state.authorized = true }),
    logout: () => mutate((state) => { state.authorized = false }),
  },
}), { name: 'auth-store' });
