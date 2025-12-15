import { dataExtractionWrapper, getAccountsByIdMembers } from '@/shared/api';
import { useQuery, queryOptions } from '@tanstack/react-query';

export const getAccountMembersQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['account', id, 'members'],
    queryFn: () =>
      dataExtractionWrapper(getAccountsByIdMembers({ path: { id } })),
  });

export const useAccountMembers = (id: number) => {
  const { data: members, ...rest } = useQuery(
    getAccountMembersQueryOptions(id),
  );
  return { members, ...rest };
};
