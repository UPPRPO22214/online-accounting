import type React from 'react';
import { Link } from 'wouter';

import { Button, Loader, ErrorMessage } from '@/shared/ui';
import { useProfile } from '@/entities/User';
import { AccountForm } from './AccountForm';
import { useAccounts } from '@/entities/Account';
import { useLogout } from '@/entities/User/api';
import { membersLabels } from '@/entities/AccountMember';
import { useEffect, useState } from 'react';
import type { HandlersAccountRoleResponse } from '@/shared/api';
import { roleCmp } from '@/entities/AccountMember/model';

export const ProfileLayout: React.FC = () => {
  const { user, isLoading: profileLoading, error: profileError } = useProfile();

  const {
    accounts,
    isLoading: accountsLoading,
    error: accountsError,
  } = useAccounts();
  const [sortedAccounts, setSortedAccounts] = useState<
    HandlersAccountRoleResponse[]
  >([]);
  useEffect(() => {
    if (!accounts) return;
    setSortedAccounts(accounts.toSorted((a, b) => -roleCmp(a.role, b.role)));
  }, [accounts]);

  const { logout, isPending: logoutPending } = useLogout();

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

      <Loader isLoading={accountsLoading} />
      <ErrorMessage message={accountsError?.message} />
      {accounts?.length === 0 ? (
        <>
          <h3 className="text-lg mt-4">У вас пока нет доступных счетов</h3>
          <h4 className="text-md mt-2">
            Создайте новый или попросите добавить вас к уже существующему
          </h4>
        </>
      ) : (
        <>
          <h3 className="text-lg mt-4">Доступные счета</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {sortedAccounts.map((account) => (
              <Link
                className="hover:bg-gray-200 transition-base"
                href={`/account/${account.id}`}
                key={account.id}
              >
                <div className="p-3 border">
                  {account.name} ({membersLabels[account.role]})
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      <Button
        className="p-1 px-3 hover:cursor-pointer w-fit m-auto"
        onClick={() => {
          logout();
        }}
      >
        {logoutPending ? <Loader /> : 'Выйти'}
      </Button>
    </div>
  );
};
