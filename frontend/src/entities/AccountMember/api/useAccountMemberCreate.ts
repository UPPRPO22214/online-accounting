import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dataExtractionWrapper,
  postAccountsByIdMembers,
  type HandlersMessageResponse,
  type PostAccountsByIdMembersData,
} from '@/shared/api';
import { getAccountMembersQueryOptions } from './useAccountMembers';

export const useAccountMemberCreate = (
  accountId: number,
  onSuccess?: (response: HandlersMessageResponse) => void,
) => {
  const queryClient = useQueryClient();
  const { mutate: createAccountMember, ...rest } = useMutation({
    mutationFn: (data: PostAccountsByIdMembersData['body']) =>
      dataExtractionWrapper(
        postAccountsByIdMembers({
          body: {
            ...data,
          },
          path: {
            id: accountId,
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
  return { createAccountMember, ...rest };
};
