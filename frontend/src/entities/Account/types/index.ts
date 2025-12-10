import type { User } from "@/entities/User";

export type Account = {
  id: string;
  title: string;
};

export type MemberRole = 'owner' | 'admin' | 'contributor' | 'viewer';

export const membersLabels: Record<MemberRole, string> = {
  owner: "Владелец",
  admin: "Админ",
  contributor: "Редактор",
  viewer: "Смотрящий"
};

export type AccountMember = User & {
  role: MemberRole;
};
