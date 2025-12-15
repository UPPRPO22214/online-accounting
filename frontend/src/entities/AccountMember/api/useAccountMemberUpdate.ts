import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dataExtractionWrapper,
  patchAccountsByIdMembersByUserId,
  type HandlersChangeRoleRequest,
  type HandlersMessageResponse,
} from '@/shared/api';
import { getAccountMembersQueryOptions } from './useAccountMembers';

export const useAccountMemberUpdate = (
  accountId: number,
  onSuccess?: (response: HandlersMessageResponse) => void,
) => {
  const queryClient = useQueryClient();
  const { mutate: updateAccountMember, ...rest } = useMutation({
    mutationFn: (data: {
      role: HandlersChangeRoleRequest['role'];
      userId: number;
    }) =>
      dataExtractionWrapper(
        patchAccountsByIdMembersByUserId({
          body: {
            role: data.role,
          },
          path: {
            id: accountId,
            user_id: data.userId,
          },
        }),
      ),
    onSuccess: (response) => {
      queryClient.resetQueries({
        queryKey: getAccountMembersQueryOptions(accountId).queryKey,
      });
      onSuccess?.(response);
    },
  });
  return { updateAccountMember, ...rest };
};
