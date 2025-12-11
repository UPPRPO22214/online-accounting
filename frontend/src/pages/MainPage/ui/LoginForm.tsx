import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, ErrorMessage } from '@/shared/ui';
import { login } from '@/entities/User';
import { loginZodSchema, type LoginType } from '../types';

type LoginFormProps = HTMLAttributes<HTMLDivElement>;

export const LoginForm: React.FC<LoginFormProps> = ({ className }) => {
  const { register, handleSubmit, formState } = useForm<LoginType>({
    resolver: zodResolver(loginZodSchema),
  });

  return (
    <div className={clsx('border p-2', className)}>
      <h2 className="text-2xl mb-2">Вход</h2>
      <form
        onSubmit={handleSubmit((loginValues) => {
          login(loginValues.email, loginValues.password);
          location.reload(); // Убрать все такие релоады, когда будет реальное апи
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
        <Button className="hover:cursor-pointer">Войти</Button>
      </form>
    </div>
  );
};
