import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, ErrorMessage } from '@/shared/ui';
import { registerZodSchema, type RegisterType } from '../types';
import { useRegister } from '@/entities/User/api';

type RegisterFormProps = HTMLAttributes<HTMLDivElement>;

export const RegisterForm: React.FC<RegisterFormProps> = ({ className }) => {
  const { register, handleSubmit, formState } = useForm<RegisterType>({
    resolver: zodResolver(registerZodSchema),
  });

  const {
    register: registerRequest,
    isPending,
    error,
  } = useRegister(() => {
    console.log('registered');
  });

  return (
    <div className={clsx('border p-2', className)}>
      <h2 className="text-2xl mb-2">Регистрация</h2>
      <form
        onSubmit={handleSubmit((registerValues) => {
          registerRequest({ ...registerValues });
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
        <Button className="hover:cursor-pointer" disabled={isPending}>
          {isPending ? 'Загрузка' : 'Зарегистрироваться'}
        </Button>
        <ErrorMessage message={error?.message} />
      </form>
    </div>
  );
};
