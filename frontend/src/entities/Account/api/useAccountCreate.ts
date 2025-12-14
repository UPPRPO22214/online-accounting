import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dataExtractionWrapper,
  postAccounts,
  type HandlersIdResponse,
} from '@/shared/api';
import { getAccountQueryOptions } from './useAccount';
import { getAccountsQueryOptions } from './useAccounts';

export const useAccountCreate = (
  onSuccess?: (response: HandlersIdResponse) => void,
) => {
  const queryClient = useQueryClient();
  const { mutate: createAccount, ...rest } = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      dataExtractionWrapper(
        postAccounts({
          body: {
            ...data,
          },
        }),
      ),
    onSuccess: (response) => {
      if (response.id)
        queryClient.resetQueries({
          queryKey: getAccountQueryOptions(response.id).queryKey,
        });
      queryClient.resetQueries({
        queryKey: getAccountsQueryOptions().queryKey,
      });
      onSuccess?.(response);
    },
  });
  return { createAccount, ...rest };
};
