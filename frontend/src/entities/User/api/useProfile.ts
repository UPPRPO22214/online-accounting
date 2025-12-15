import { dataExtractionWrapper, getAuthProfile } from '@/shared/api';
import { queryOptions, useQuery } from '@tanstack/react-query';

export const getProfileQueryOptions = () =>
  queryOptions({
    queryKey: ['profile'],
    queryFn: () => dataExtractionWrapper(getAuthProfile()),
  });

export const useProfile = () => {
  const { data: user, ...rest } = useQuery(getProfileQueryOptions());
  return { user, ...rest };
};
