import { getLocalStorageItem, saveLocalStorageItem } from '@/shared/api';
import type { AccountMember, Account } from '../types';
import type { User } from '@/entities/User';

export const getAccount = (userId: number, accountId: string) => {
  const accounts = getUserAccounts(userId); // Пока что только среди своих ищем, потом будет иначе
  return accounts.find((account) => account.id === accountId);
};

export const getAccountMembers = (accountId: string) => {
  return getLocalStorageItem<AccountMember[]>(`members-${accountId}`, []);
};

export const addAccountMember = (accountId: string, member: AccountMember) => {
  const members = getAccountMembers(accountId);
  if (members.some((other) => other.id === member.id)) {
    console.error('[ADD ACCOUNT MEMBER] Member already exists');
    return;
  }
  saveLocalStorageItem<AccountMember[]>(`members-${accountId}`, [
    ...members,
    member,
  ]);
};

export const editAccountMember = (
  accountId: string,
  newMember: AccountMember,
) => {
  const members = getAccountMembers(accountId);
  if (members.every((other) => other.id !== newMember.id)) {
    console.error("[EDIT ACCOUNT MEMBER] Member doesn't exist");
    return;
  }
  saveLocalStorageItem<AccountMember[]>(
    `members-${accountId}`,
    members.map((member) => (member.id !== newMember.id ? member : newMember)),
  );
};

export const removeAccountMember = (
  accountId: string,
  member: AccountMember,
) => {
  const members = getAccountMembers(accountId);
  const filteredMembers = members.filter((other) => other.id !== member.id);
  if (members.length === filteredMembers.length) {
    console.error("[REMOVE ACCOUNT MEMBER] Member doesn't exist");
    return;
  }
  saveLocalStorageItem<AccountMember[]>(
    `members-${accountId}`,
    filteredMembers,
  );
};

export const getUserAccounts = (ownerId: number) => {
  return getLocalStorageItem<Account[]>(`accounts-${ownerId}`, []);
};

export const createAccount = (owner: User, newAccount: Account) => {
  const otherAccounts = getLocalStorageItem<Account[]>(
    `accounts-${owner.id}`,
    [],
  );
  saveLocalStorageItem<Account[]>(`accounts-${owner.id}`, [
    ...otherAccounts,
    newAccount,
  ]);
  addAccountMember(newAccount.id, { ...owner, role: 'owner' });
};
