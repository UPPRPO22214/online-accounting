import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import type React from 'react';

import { Button, ErrorMessage } from '@/shared/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createAccount } from '@/entities/Account';
import { useAuthStore } from '@/entities/User';

type AccountFormProps = HTMLAttributes<HTMLDivElement>;

const accountZodSchema = z.object({
  title: z
    .string()
    .min(1, 'Минимум один символ')
    .max(50, 'Максимальная длина названия - 50 символов'),
});

type AccountCreate = z.infer<typeof accountZodSchema>;

export const AccountForm: React.FC<AccountFormProps> = ({ className }) => {
  const user = useAuthStore((state) => state.user);

  const { register, handleSubmit, formState } = useForm<AccountCreate>({
    resolver: zodResolver(accountZodSchema),
  });

  return (
    <div className={clsx('border p-2', className)}>
      <form
        onSubmit={handleSubmit((value) => {
          createAccount(user.id, {
            ...value,
            id: crypto.randomUUID(),
          });
        })}
        className="grid grid-cols-1 md:grid-cols-6 gap-x-4 gap-y-2"
      >
        <input
          className="md:col-span-5 bg-gray-100 p-1"
          placeholder="Название счёта"
          {...register('title')}
        />
        <Button className="hover:cursor-pointer">Создать счёт</Button>
        <ErrorMessage
          className="md:col-span-5"
          message={
            formState.errors.title?.message || formState.errors.root?.message
          }
        />
      </form>
    </div>
  );
};
