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
