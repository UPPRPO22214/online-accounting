import { getLocalStorageItem, saveLocalStorageItem } from '@/shared/api';
import type { User } from '../types';
import { removeLocalStorageItem } from '@/shared/api/localStorage';

export const getUsers = () => {
  return getLocalStorageItem<User[]>('users', []);
};

export const register = (user: Omit<User, 'id'>) => {
  const users = getUsers();
  if (users.some((other) => other.email === user.email)) {
    console.error('user already exists');
    return;
  }
  saveLocalStorageItem<User[]>('users', [
    ...users,
    { ...user, id: users.length },
  ]);
};

export const getMe = () =>
  getLocalStorageItem<User | undefined>('me', undefined);

export const login = (email: string, password: string) => {
  const user = getUsers().find(
    (user) => user.email === email && user.nickname === password,
  ); // Ясное дело, это тестовый вариант проверки пароля, потому что добавлять его в DTO юзера не планирую
  if (user) {
    saveLocalStorageItem<User>('me', user);
  }
  return user;
};

export const logout = () => removeLocalStorageItem<User>('me');
