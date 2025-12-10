import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'wouter';

import { OperationDialogWindow } from './OperationDialogWindow';
// import { useAuthStore, type User } from '@/entities/User';
import { useAuthStore } from '@/entities/User';
import { getAccount, type Account } from '@/entities/Account';
import { OpeartionsDashboard } from './OpeartionsDashboard';
import { MembersPanel } from './MembersPanel';

export const AccountPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const [account, setAccount] = useState<Account>();

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const account = getAccount(user.id, accountId);
    setAccount(account);
  }, [user, accountId]);

  if (!account)
    return (
      <div className="w-full">
        <h1 className="text-center text-2xl text-red-500">
          Счёт с ID {accountId} не найден
        </h1>
        <Link href="/">На главную</Link>
      </div>
    );

  return (
    <div className="w-full">
      <h1 className="text-center text-2xl m-10">Счёт {account.title}</h1>
      <Link href="/">На главную</Link>
      <MembersPanel className='w-full my-4' accountId={accountId} />
      <OpeartionsDashboard accountId={accountId} />
      <OperationDialogWindow />
    </div>
  );
};
