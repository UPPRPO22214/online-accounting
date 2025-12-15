import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dataExtractionWrapper,
  patchTransactionsById,
  type HandlersUpdateTransactionRequest,
} from '@/shared/api';
import { getTransactionsQueryOptions } from './useTransactions';

export const useTransactionUpdate = (
  accountId: number,
  transactionId: number,
  onSuccess?: () => void,
) => {
  const queryClient = useQueryClient();
  const { mutate: updateTransaction, ...rest } = useMutation({
    mutationFn: (data: HandlersUpdateTransactionRequest) =>
      dataExtractionWrapper(
        patchTransactionsById({
          path: { id: transactionId },
          body: {
            ...data,
          },
        }),
      ),
    onSuccess: () => {
      queryClient.resetQueries({
        queryKey: getTransactionsQueryOptions(accountId).queryKey,
      });
      onSuccess?.();
    },
  });
  return { updateTransaction, ...rest };
};
