import { useQuery, queryOptions } from '@tanstack/react-query';

export const getAccountMembersQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['account', id, 'members'],
    // queryFn: () => dataExtractionWrapper(getAccountsById({ path: { id } })) // TODO: !!!
  });

export const useAccountMembers = (id: number) => {
  const { data: members, ...rest } = useQuery(getAccountMembersQueryOptions(id));
  return { members, ...rest };
};
