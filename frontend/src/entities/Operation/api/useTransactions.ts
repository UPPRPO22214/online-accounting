import { useQuery, queryOptions } from '@tanstack/react-query';
import {
  dataExtractionWrapper,
  getAccountsByIdTransactions,
  type GetAccountsByIdTransactionsData,
} from '@/shared/api';

export const getTransactionsQueryOptions = (id: number, query?: GetAccountsByIdTransactionsData['query'] ) =>
  queryOptions({
    queryKey: ['transactions', id, query ? JSON.stringify(query) : ''],
    queryFn: () =>
      dataExtractionWrapper(getAccountsByIdTransactions({ path: { id }, query })),
  });

export const useTransactions = (id: number, query?: GetAccountsByIdTransactionsData['query'] ) => {
  const { data: transactions, ...rest } = useQuery(
    getTransactionsQueryOptions(id, query),
  );

  return { transactions, ...rest };
};
