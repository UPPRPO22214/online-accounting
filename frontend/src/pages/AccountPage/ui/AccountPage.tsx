import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'wouter';

import { OperationDialogWindow } from './OperationDialogWindow';
import { getAccount, type Account } from '@/entities/Account';
import { OpeartionsDashboard } from './OpeartionsDashboard';
import { MembersPanel } from './MembersPanel';
import { getMyRole, type AccountMember } from '@/entities/AccountMember';

export const AccountPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const [account, setAccount] = useState<Account>();

  const [meMember, setMeMember] = useState<AccountMember>();
  useEffect(() => {
    const user = getMyRole(accountId);
    setMeMember(user);
    if (!user) return;
    const account = getAccount(accountId);
    setAccount(account);
  }, [accountId]); // Именно так, а не в одном хуке, потому что далее юзер будет получаться асинхронно

  if (!meMember)
    return (
      <div className="w-full">
        <Link href="/">На главную</Link>
        <h1 className="text-center text-2xl text-red-500">
          У вас нет прав на просмотр счёта
        </h1>
      </div>
    );

  if (!account)
    return (
      <div className="w-full">
        <Link href="/">На главную</Link>
        <h1 className="text-center text-2xl text-red-500">
          Счёт с ID {accountId} не найден
        </h1>
      </div>
    );

  return (
    <div className="w-full">
      <Link href="/">На главную</Link>
      <h1 className="text-center text-2xl m-10">Счёт {account.title}</h1>
      <MembersPanel className="w-full my-4" accountId={accountId} />
      <OpeartionsDashboard accountId={accountId} />
      <OperationDialogWindow />
    </div>
  );
};
