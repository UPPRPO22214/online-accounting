import { getLocalStorageItem, saveLocalStorageItem } from '@/shared/api';
import type { AccountMember, MemberRole } from '../types';
import { getMe, getUsers } from '@/entities/User/@x/accountMember';

export const getAccountMembers = (accountId: number) => {
  return getLocalStorageItem<AccountMember[]>(`members-${accountId}`, []);
};

export const getMyRole = (accountId: number) => {
  const me = getMe();
  if (!me) return;
  return getAccountMembers(accountId).find((member) => member.id === me.id);
};

export const addAccountMember = (
  accountId: number,
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
  accountId: number,
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
  accountId: number,
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
