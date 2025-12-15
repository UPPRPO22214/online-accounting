import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataExtractionWrapper, postAuthLogin } from '@/shared/api';
import { getProfileQueryOptions } from './useProfile';

export const useLogin = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { mutate: login, ...rest } = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      dataExtractionWrapper(
        postAuthLogin({
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
  return { login, ...rest };
};
