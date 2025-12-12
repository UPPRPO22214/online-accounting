import { getLocalStorageItem, saveLocalStorageItem } from '@/shared/api';
import type { Account } from '../types';
import { type User } from '@/entities/User/@x/account';
import {
  getAccountMembers,
  addAccountMember,
} from '@/entities/AccountMember/@x/account';

export const getAccounts = () => getLocalStorageItem<Account[]>('accounts', []);

export const getAccount = (accountId: string) => {
  return getAccounts().find((account) => account.id === accountId);
};

export const getUserAccounts = (userId: number) => {
  return getAccounts().filter((account) =>
    getAccountMembers(account.id).some((member) => member.id === userId),
  );
};

export const createAccount = (owner: User, newAccount: Account) => {
  const otherAccounts = getAccounts();
  saveLocalStorageItem<Account[]>('accounts', [...otherAccounts, newAccount]);
  addAccountMember(newAccount.id, owner.email, 'owner');
};
