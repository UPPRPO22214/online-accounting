import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import type React from 'react';

import { Button, ErrorMessage, Loader } from '@/shared/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProfile } from '@/entities/User';
import { useAccountCreate } from '@/entities/Account';

type AccountFormProps = HTMLAttributes<HTMLDivElement>;

const accountZodSchema = z.object({
  name: z
    .string()
    .min(1, 'Минимум один символ')
    .max(50, 'Максимальная длина названия - 50 символов'),
  description: z.string().optional(),
});

type AccountCreate = z.infer<typeof accountZodSchema>;

export const AccountForm: React.FC<AccountFormProps> = ({ className }) => {
  const { user, isLoading: profileLoading, error: profileError } = useProfile();

  const { register, handleSubmit, formState } = useForm<AccountCreate>({
    resolver: zodResolver(accountZodSchema),
  });

  const {
    createAccount,
    isPending: createPending,
    error: createError,
  } = useAccountCreate();

  return (
    <div className={clsx('border p-2', className)}>
      <Loader isLoading={profileLoading} />
      <ErrorMessage message={profileError?.message} />
      {user && (
        <form
          onSubmit={handleSubmit((value) => createAccount(value))}
          className="grid grid-cols-1 md:grid-cols-6 gap-x-4 gap-y-2"
        >
          <input
            className="md:col-span-2 bg-gray-100 p-1"
            placeholder="Название счёта"
            {...register('name')}
          />
          <input
            className="md:col-span-3 bg-gray-100 p-1"
            placeholder="Описание (опционально)"
            {...register('description')}
          />
          <Button className="hover:cursor-pointer">
            {createPending ? <Loader /> : 'Создать счёт'}
          </Button>
          <ErrorMessage
            className="md:col-span-5"
            message={
              formState.errors.name?.message ||
              formState.errors.root?.message ||
              createError?.message
            }
          />
        </form>
      )}
    </div>
  );
};
