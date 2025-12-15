export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type MemberChoosableRole = Exclude<MemberRole, 'owner'>;

export const membersLabels: Record<MemberRole, string> = {
  owner: 'Владелец',
  admin: 'Админ',
  editor: 'Редактор',
  viewer: 'Смотрящий',
};

export const membersChoosableLabels: Record<MemberChoosableRole, string> = {
  admin: membersLabels.admin,
  editor: membersLabels.editor,
  viewer: membersLabels.viewer,
};
