import { getLocalStorageItem, saveLocalStorageItem } from '@/shared/api';
import type { AccountMember, Account, MemberRole } from '../types';
import { type User, getMe, getUsers } from '@/entities/User/@x/account';

export const getAccounts = () => getLocalStorageItem<Account[]>('accounts', []);

export const getAccount = (accountId: string) => {
  return getAccounts().find((account) => account.id === accountId);
};

export const getAccountMembers = (accountId: string) => {
  return getLocalStorageItem<AccountMember[]>(`members-${accountId}`, []);
};

export const getMyRole = (accountId: string) => {
  const me = getMe();
  if (!me) return;
  return getAccountMembers(accountId).find((member) => member.id === me.id);
};

export const addAccountMember = (
  accountId: string,
  email: string,
  role: MemberRole,
) => {
  const user = getUsers().find((user) => user.email === email);
  if (!user) return;
  const members = getAccountMembers(accountId);
  if (members.some((other) => other.id === user.id)) {
    console.error('[ADD ACCOUNT MEMBER] Member already exists');
    return;
  }
  saveLocalStorageItem<AccountMember[]>(`members-${accountId}`, [
    ...members,
    { ...user, role },
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
    members.map((member) => (member.id === newMember.id ? newMember : member)),
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
