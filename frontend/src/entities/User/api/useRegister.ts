import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataExtractionWrapper, postAuthRegister } from '@/shared/api';
import { getProfileQueryOptions } from './useProfile';

export const useRegister = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { mutate: register, ...rest } = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      dataExtractionWrapper(
        postAuthRegister({
          body: {
            ...data,
          },
        }),
      ),
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: getProfileQueryOptions().queryKey });
      onSuccess?.();
    },
  });
  return { register, ...rest };
};
