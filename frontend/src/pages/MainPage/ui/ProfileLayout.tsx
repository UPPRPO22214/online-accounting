import type React from 'react';
import { Link } from 'wouter';

// import { Button, Loader ErrorMessage } from '@/shared/ui';
import { Loader, ErrorMessage } from '@/shared/ui';
import { useProfile } from '@/entities/User';
import { AccountForm } from './AccountForm';
import { useAccounts } from '@/entities/Account';

export const ProfileLayout: React.FC = () => {
  const { user, isLoading: profileLoading, error: profileError } = useProfile();
  const {
    accounts,
    isLoading: accountsLoading,
    error: accountsError,
  } = useAccounts();

  return (
    <div className="grid grid-cols-1 gap-6">
      <Loader isLoading={profileLoading} />
      <ErrorMessage message={profileError?.message} />
      {user && (
        <>
          <h2 className="text-2xl text-center">Аккаунт {user.email}</h2>
          <AccountForm />
        </>
      )}

      <h3 className="text-lg mt-4">Доступные счета</h3>
      <div className="flex justify-around gap-4">
        <Loader isLoading={accountsLoading} />
        <ErrorMessage message={accountsError?.message} />
        {accounts?.map((account) => (
          <Link
            className="hover:bg-gray-200 transition-base"
            href={`/account/${account.id}`}
            key={account.id}
          >
            <div className="p-3 border">
              {account.name} ({account.role})
            </div>
          </Link>
        ))}
      </div>
      {/* TODO: !!! */}
      {/* <Button
        className="p-1 px-3 hover:cursor-pointer w-fit m-auto"
        onClick={() => {
          logout();
          location.reload(); // Убрать все такие релоады, когда будет реальное апи
        }}
      >
        Выйти
      </Button> */}
    </div>
  );
};
