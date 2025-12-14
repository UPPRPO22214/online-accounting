import { useQuery, queryOptions } from '@tanstack/react-query';
import { dataExtractionWrapper, getAccountsById } from '@/shared/api';

export const getAccountQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['card', id],
    queryFn: () => dataExtractionWrapper(getAccountsById({ path: { id } }))
  });

export const useAccount = (id: number) => {
  const { data: account, ...rest } = useQuery(getAccountQueryOptions(id));

  return { account, ...rest };
};
