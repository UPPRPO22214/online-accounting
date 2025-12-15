import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataExtractionWrapper, postAuthLogout } from '@/shared/api';
import { getProfileQueryOptions } from './useProfile';

export const useLogout = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { mutate: logout, ...rest } = useMutation({
    mutationFn: () => dataExtractionWrapper(postAuthLogout()),
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: getProfileQueryOptions().queryKey });
      onSuccess?.();
    },
  });
  return { logout, ...rest };
};
