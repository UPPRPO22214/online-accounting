import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dataExtractionWrapper,
  postAccountsByIdTransactions,
  type HandlersCreateTransactionRequest,
  type HandlersIdResponse,
} from '@/shared/api';
import { getTransactionsQueryOptions } from './useTransactions';

export const useTransactionCreate = (
  accountId: number,
  onSuccess?: (response: HandlersIdResponse) => void,
) => {
  const queryClient = useQueryClient();
  const { mutate: createTransaction, ...rest } = useMutation({
    mutationFn: (data: HandlersCreateTransactionRequest) =>
      dataExtractionWrapper(
        postAccountsByIdTransactions({
          path: { id: accountId },
          body: {
            ...data,
          },
        }),
      ),
    onSuccess: (response) => {
      if (response.id)
        queryClient.resetQueries({
          queryKey: getTransactionsQueryOptions(accountId).queryKey,
        });
      onSuccess?.(response);
    },
  });
  return { createTransaction, ...rest };
};
