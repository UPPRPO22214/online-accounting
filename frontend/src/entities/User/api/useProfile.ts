import { queryOptions, useQuery } from '@tanstack/react-query';

export const getProfileQueryOptions = () =>
  queryOptions({
    queryKey: ['profile'],
    // queryFn: () => dataExtractionWrapper(getAccountsById({ path: { id } })) // TODO: !!!
  });

export const useProfile = () => {
  const { data: user, ...rest } = useQuery(getProfileQueryOptions());
  return { user, ...rest };
};
