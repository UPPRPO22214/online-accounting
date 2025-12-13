import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, ErrorMessage } from '@/shared/ui';
import { register as regsiterRequest } from '@/entities/User';
import { registerZodSchema, type RegisterType } from '../types';

type RegisterFormProps = HTMLAttributes<HTMLDivElement>;

export const RegisterForm: React.FC<RegisterFormProps> = ({ className }) => {
  const { register, handleSubmit, formState } = useForm<RegisterType>({
    resolver: zodResolver(registerZodSchema),
  });

  return (
    <div className={clsx('border p-2', className)}>
      <h2 className="text-2xl mb-2">Регистрация</h2>
      <form
        onSubmit={handleSubmit((registerValues) => {
          regsiterRequest({ ...registerValues });
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
          placeholder="Никнейм"
          {...register('nickname')}
        />
        <ErrorMessage message={formState.errors.nickname?.message} />
        <input
          className="bg-gray-100 p-1"
          type="password"
          placeholder="Пароль"
          {...register('password')}
        />
        <ErrorMessage message={formState.errors.password?.message} />
        <input
          className="bg-gray-100 p-1"
          type="password"
          placeholder="Повторите пароль"
          {...register('passwordTwice')}
        />
        <ErrorMessage
          message={
            formState.errors.passwordTwice?.message ||
            formState.errors.root?.message
          }
        />
        <Button className="hover:cursor-pointer">Зарегистрироваться</Button>
      </form>
    </div>
  );
};
