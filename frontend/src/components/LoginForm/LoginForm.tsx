import { useAuth } from '@/store/auth';
import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import type React from 'react';

type LoginFormProps = HTMLAttributes<HTMLDivElement>;

export const LoginForm: React.FC<LoginFormProps> = ({ className }) => {
  const { login } = useAuth();

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
        <button
          className="p-1 transition-base bg-gray-200 hover:bg-gray-300 hover:cursor-pointer"
          type="submit"
        >
          Войти
        </button>
      </form>
    </div>
  );
};
