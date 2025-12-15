import type { MemberRole } from '../types';

/**
 * Проверяет, соответствует ли роль пользователя требованию в смысле колец прав доступа по убыванию: owner > admin > contributor > viewer > undefined
 *
 * @param userRole роль пользователя
 * @param requiredRole требуемая роль
 * @returns true, если роль пользователя соответствует и false в ином случае
 */
export const checkRole = (
  userRole?: MemberRole,
  requiredRole?: MemberRole,
): boolean => {
  if (!userRole) return false;
  if (!requiredRole) return true;
  switch (userRole) {
    case 'owner':
      return true;
    case 'admin':
      return requiredRole !== 'owner';
    case 'editor':
      return requiredRole === 'editor' || requiredRole === 'viewer';
    case 'viewer':
      return requiredRole === 'viewer';
  }
  userRole satisfies never;
};

export const roleCmp = (role1: MemberRole, role2: MemberRole) => {
  if (role1 === 'owner') return role2 === 'owner' ? 0 : 1;
  if (role1 === 'admin') {
    if (role2 === 'owner') return -1;
    if (role2 === 'admin') return 0;
    return 1;
  }
  if (role1 === 'editor') {
    if (role2 === 'owner' || role2 === 'admin') return -1;
    if (role2 === 'editor') return 0;
    return 1;
  }
  if (role1 == 'viewer') return role2 === 'viewer' ? 0 : -1;

  role1 satisfies never;
  return 0;
}
