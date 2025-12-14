import { useQuery, queryOptions } from '@tanstack/react-query';
import {
  dataExtractionWrapper,
  getAccountsByIdTransactions,
} from '@/shared/api';

export const getTransactionsQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['transactions', id],
    queryFn: () =>
      dataExtractionWrapper(getAccountsByIdTransactions({ path: { id } })),
  });

export const useTransactions = (id: number) => {
  const { data: transactions, ...rest } = useQuery(
    getTransactionsQueryOptions(id),
  );

  return { transactions, ...rest };
};
