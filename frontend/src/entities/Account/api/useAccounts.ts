import { useQuery, queryOptions } from '@tanstack/react-query';
import { dataExtractionWrapper, getAccounts } from '@/shared/api';

export const getAccountsQueryOptions = () =>
  queryOptions({
    queryKey: ['accounts'],
    queryFn: () => dataExtractionWrapper(getAccounts()),
  });

export const useAccounts = () => {
  const { data: accounts, ...rest } = useQuery(getAccountsQueryOptions());

  return { accounts, ...rest };
};
