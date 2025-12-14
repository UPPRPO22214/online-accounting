import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataExtractionWrapper, deleteTransactionsById } from '@/shared/api';
import { getTransactionsQueryOptions } from './useTransactions';

export const useTransactionDelete = (
  accountId: number,
  transactionId: number,
  onSuccess?: () => void,
) => {
  const queryClient = useQueryClient();
  const { mutate: deleteTransaction, ...rest } = useMutation({
    mutationFn: () =>
      dataExtractionWrapper(
        deleteTransactionsById({
          path: { id: transactionId },
        }),
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: getTransactionsQueryOptions(accountId).queryKey,
      });
      onSuccess?.();
    },
  });
  return { deleteTransaction, ...rest };
};
