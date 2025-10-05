import { useAuth } from '@/state/auth';
import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import type React from 'react';
import { Button } from '@/components/Button';

type RegisterFormProps = HTMLAttributes<HTMLDivElement>;

export const RegisterForm: React.FC<RegisterFormProps> = ({ className }) => {
  const login = useAuth((state) => state.actions.login);

  return (
    <div className={clsx('border p-2', className)}>
      <h2 className="text-2xl mb-2">Регистрация</h2>
      <form onSubmit={() => login()} className="grid grid-cols-1 gap-4">
        <input
          className="bg-gray-100 p-1"
          type="text"
          placeholder="Логин"
          name="reg-login"
          id="reg-login"
        />
        <input
          className="bg-gray-100 p-1"
          type="password"
          placeholder="Пароль"
          name="reg-password1"
          id="reg-password1"
        />
        <input
          className="bg-gray-100 p-1"
          type="password"
          placeholder="Повторите пароль"
          name="reg-password2"
          id="reg-password2"
        />
        <Button className="hover:cursor-pointer">Зарегистрироваться</Button>
      </form>
    </div>
  );
};
