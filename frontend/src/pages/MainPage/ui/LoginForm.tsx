import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, ErrorMessage } from '@/shared/ui';
import { loginZodSchema, type LoginType } from '../types';
import { useLogin } from '@/entities/User/api/useLogin';

type LoginFormProps = HTMLAttributes<HTMLDivElement>;

export const LoginForm: React.FC<LoginFormProps> = ({ className }) => {
  const { register, handleSubmit, formState } = useForm<LoginType>({
    resolver: zodResolver(loginZodSchema),
  });

  const { login, isPending, error } = useLogin(() => {
    console.log('logged in');
  });

  return (
    <div className={clsx('border p-2', className)}>
      <h2 className="text-2xl mb-2">Вход</h2>
      <form
        onSubmit={handleSubmit((loginValues) => {
          login(loginValues);
        })}
        className="grid grid-cols-1 gap-4"
      >
        <input
          className="bg-gray-100 p-1"
          type="email"
          placeholder="Электронная почта"
          {...register('email')}
        />
        <ErrorMessage message={formState.errors.email?.message} />
        <input
          className="bg-gray-100 p-1"
          type="password"
          placeholder="Пароль"
          {...register('password')}
        />
        <ErrorMessage
          message={
            formState.errors.password?.message || formState.errors.root?.message
          }
        />
        <Button className="hover:cursor-pointer" disabled={isPending}>
          {isPending ? 'Загрузка' : 'Войти'}
        </Button>
        <ErrorMessage message={error?.message} />
      </form>
    </div>
  );
};
