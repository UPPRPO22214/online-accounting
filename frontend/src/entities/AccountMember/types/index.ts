import type { User } from '@/entities/User/@x/accountMember';

export type MemberRole = 'owner' | 'admin' | 'contributor' | 'viewer';
export type MemberChoosableRole = Exclude<MemberRole, 'owner'>;

export const membersLabels: Record<MemberRole, string> = {
  owner: 'Владелец',
  admin: 'Админ',
  contributor: 'Редактор',
  viewer: 'Смотрящий',
};

export const membersChoosableLabels: Record<MemberChoosableRole, string> = {
  admin: membersLabels.admin,
  contributor: membersLabels.contributor,
  viewer: membersLabels.viewer,
};

export type AccountMember = User & {
  role: MemberRole;
};
