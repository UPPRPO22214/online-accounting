import { getLocalStorageItem, saveLocalStorageItem } from '@/shared/api';
import type { Account } from '../types';

export const getAccount = (userId: number, accountId: string) => {
  const accounts = getUserAccounts(userId); // Пока что только среди своих ищем, потом будет иначе
  return accounts.find((account) => account.id === accountId);
};

// TODO: getAccountMembers

// TODO: addAccountMember

// TODO: removeAccountMember

export const getUserAccounts = (ownerId: number) => {
  return getLocalStorageItem<Account[]>(`accounts-${ownerId}`, []);
};

export const createAccount = (ownerId: number, newAccount: Account) => {
  const otherAccounts = getLocalStorageItem<Account[]>(
    `accounts-${ownerId}`,
    [],
  );
  saveLocalStorageItem<Account[]>(`accounts-${ownerId}`, [
    ...otherAccounts,
    newAccount,
  ]);
};
