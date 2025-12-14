import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dataExtractionWrapper,
  patchAccountsByIdMembersByUserId,
  type HandlersMessageResponse,
  type PostAccountsByIdMembersData,
} from '@/shared/api';
import { getAccountMembersQueryOptions } from './useAccountMembers';

export const useAccountMemberUpdate = (
  accountId: number,
  onSuccess?: (response: HandlersMessageResponse) => void,
) => {
  const queryClient = useQueryClient();
  const { mutate: updateAccountMember, ...rest } = useMutation({
    mutationFn: (data: {body: PostAccountsByIdMembersData['body'], userId: number}) =>
      dataExtractionWrapper(
        patchAccountsByIdMembersByUserId({
          body: {
            ...data.body,
          },
          path: {
            id: accountId,
            user_id: data.userId
          },
        }),
      ),
    onSuccess: (response) => {
      queryClient.refetchQueries({
        queryKey: getAccountMembersQueryOptions(accountId).queryKey,
      });
      onSuccess?.(response);
    },
  });
  return { updateAccountMember, ...rest };
};
