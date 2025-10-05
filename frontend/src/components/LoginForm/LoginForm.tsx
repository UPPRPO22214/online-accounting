import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import type React from 'react';

import { Button } from '@/components/Button';
import { useAuth } from '@/state/auth';

type LoginFormProps = HTMLAttributes<HTMLDivElement>;

export const LoginForm: React.FC<LoginFormProps> = ({ className }) => {
  const login = useAuth((state) => state.actions.login);

  return (
    <div className={clsx('border p-2', className)}>
      <h2 className="text-2xl mb-2">Вход</h2>
      <form onSubmit={() => login()} className="grid grid-cols-1 gap-4">
        <input
          className="bg-gray-100 p-1"
          type="text"
          placeholder="Логин"
          name="login-login"
          id="login-login"
        />
        <input
          className="bg-gray-100 p-1"
          type="password"
          placeholder="Пароль"
          name="login-password"
          id="login-password"
        />
        <Button className="hover:cursor-pointer">Войти</Button>
      </form>
    </div>
  );
};
