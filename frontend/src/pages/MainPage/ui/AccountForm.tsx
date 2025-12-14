import clsx from 'clsx';
import { useEffect, useState, type HTMLAttributes } from 'react';
import type React from 'react';

import { Button, ErrorMessage } from '@/shared/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createAccount } from '@/entities/Account';
import { type User } from '@/entities/User';

type AccountFormProps = HTMLAttributes<HTMLDivElement>;

const accountZodSchema = z.object({
  title: z
    .string()
    .min(1, 'Минимум один символ')
    .max(50, 'Максимальная длина названия - 50 символов'),
  description: z.string().optional()
});

type AccountCreate = z.infer<typeof accountZodSchema>;

export const AccountForm: React.FC<AccountFormProps> = ({ className }) => {
  const [user, setUser] = useState<User>();
  // useEffect(() => {
  //   setUser(getMe());
  // }, []);

  const { register, handleSubmit, formState } = useForm<AccountCreate>({
    resolver: zodResolver(accountZodSchema),
  });

  if (!user) return <div>Loading...</div>;

  return (
    <div className={clsx('border p-2', className)}>
      <form
        onSubmit={handleSubmit((value) => {
          createAccount(user, {
            ...value,
            id: crypto.randomUUID(),
          });
          location.reload(); // Убрать все такие релоады, когда будет реальное апи
        })}
        className="grid grid-cols-1 md:grid-cols-6 gap-x-4 gap-y-2"
      >
        <input
          className="md:col-span-2 bg-gray-100 p-1"
          placeholder="Название счёта"
          {...register('title')}
        />
        <input
          className="md:col-span-3 bg-gray-100 p-1"
          placeholder="Описание (опционально)"
          {...register('description')}
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
