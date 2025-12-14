import { useEffect, useState } from 'react';
import { useAccountMembers } from './useAccountMembers';
import { useProfile } from '@/entities/User';
import type { HandlersMemberResponse } from '@/shared/api';

export const useMeMember = (accountId: number) => {
  const {
    members,
    isLoading: membersLoading,
    error: membersError,
  } = useAccountMembers(accountId);
  const { user, isLoading: userLoading, error: userError } = useProfile();

  const [meMember, setMeMember] = useState<HandlersMemberResponse>();
  useEffect(() => {
    if (!members || !user) return;
    setMeMember(members.find((member) => member.user_id === user?.id));
  }, [members, user]);

  return {
    meMember,
    isLoading: membersLoading || userLoading,
    error: membersError?.message || userError?.message,
  };
};
