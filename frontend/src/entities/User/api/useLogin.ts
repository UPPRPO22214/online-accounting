import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataExtractionWrapper, postAuthLogin } from '@/shared/api';

export const useLogin = (onSuccess?: () => void) => {
  // const queryClient = useQueryClient();
  const { mutate: login, ...rest } = useMutation({
    mutationFn: (data: {email: string, password: string}) =>
      dataExtractionWrapper(
        postAuthLogin({
          body: {
            ...data
          },
        })
      ),
    onSuccess: () => {
      // queryClient.setQueryData(getProfileQueryOptions().queryKey, data);
      onSuccess?.();
    },
  });
  return { login, ...rest };
};
