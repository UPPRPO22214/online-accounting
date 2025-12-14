import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dataExtractionWrapper,
  deleteAccountsByIdMembersByUserId,
} from '@/shared/api';
import { getAccountMembersQueryOptions } from './useAccountMembers';

export const useAccountMemberDelete = (
  accountId: number,
  onSuccess?: () => void,
) => {
  const queryClient = useQueryClient();
  const { mutate: deleteAccountMember, ...rest } = useMutation({
    mutationFn: (data: {userId: number}) =>
      dataExtractionWrapper(
        deleteAccountsByIdMembersByUserId({
          path: {
            id: accountId,
            user_id: data.userId
          },
        }),
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: getAccountMembersQueryOptions(accountId).queryKey,
      });
      onSuccess?.();
    },
  });
  return { deleteAccountMember, ...rest };
};
