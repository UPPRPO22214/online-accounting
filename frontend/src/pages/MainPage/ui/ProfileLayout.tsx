import type React from 'react';
import { Link } from 'wouter';

import { Button } from '@/shared/ui';
import { useAuthStore } from '@/entities/User';
import { AccountForm } from './AccountForm';
import { useEffect, useState } from 'react';
import { type Account, getUserAccounts } from '@/entities/Account';

export const ProfileLayout: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    setAccounts(getUserAccounts(user.id));
  }, [user.id]);

  return (
    <div className="grid grid-cols-1 gap-6">
      <h2 className="text-2xl text-center">
        Привет, {user.nickname} ({user.email})
      </h2>
      <h3 className="text-lg mt-4">Мои счета</h3>
      <AccountForm />
      <div className="flex justify-around gap-4">
        {accounts.map((account) => (
          <Link
            className="hover:bg-gray-200 transition-base"
            href={`/account/${account.id}`}
            key={account.id}
          >
            <div className="p-3 border">{account.title}</div>
          </Link>
        ))}
      </div>
      <h3 className="text-lg mt-4">Доступные счета</h3>
      <div className="flex justify-around gap-4">
        {accounts.map((account) => (
          <Link
            className="hover:bg-gray-200 transition-base"
            href={`/account/${account.id}`}
            key={account.id}
          >
            <div className="p-3 border">{account.title}</div>
          </Link>
        ))}
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
