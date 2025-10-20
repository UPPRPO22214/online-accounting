import type React from 'react';
import { Link } from 'wouter';

import { useAuthStore } from '../store';
import { Button } from '@/shared/ui';

export const ProfileLayout: React.FC = () => {
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.actions.logout);

  return (
    <div className="grid grid-cols-1 gap-6">
      <h2 className="text-2xl text-center">Привет, {username}</h2>
      <h3 className="text-lg mt-4">Мои счета</h3>
      <div className="flex justify-around gap-4">
        <Link className="hover:bg-gray-200 transition-base" href="/account/1">
          <div className="p-3 border">Тестовый счёт 1</div>
        </Link>
        <Link className="hover:bg-gray-200 transition-base" href="/account/1">
          <div className="p-3 border">Тестовый счёт 1</div>
        </Link>
        <Link className="hover:bg-gray-200 transition-base" href="/account/1">
          <div className="p-3 border">Тестовый счёт 1</div>
        </Link>
      </div>
      <h3 className="text-lg mt-4">Доступные счета</h3>
      <div className="flex justify-around gap-4">
        <Link className="hover:bg-gray-200 transition-base" href="/account/1">
          <div className="p-3 border">Тестовый счёт 1</div>
        </Link>
        <Link className="hover:bg-gray-200 transition-base" href="/account/1">
          <div className="p-3 border">Тестовый счёт 1</div>
        </Link>
        <Link className="hover:bg-gray-200 transition-base" href="/account/1">
          <div className="p-3 border">Тестовый счёт 1</div>
        </Link>
      </div>
      <Button
        className="p-1 px-3 hover:cursor-pointer w-fit m-auto"
        onClick={() => logout()}
      >
        Выйти
      </Button>
    </div>
  );
};
