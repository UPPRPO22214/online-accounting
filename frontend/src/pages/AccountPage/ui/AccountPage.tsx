import type React from 'react';
import { Link, useParams } from 'wouter';

import { OperationDialogWindow } from './OperationDialogWindow';
import { OpeartionsDashboard } from './OpeartionsDashboard';
import { MembersPanel } from './MembersPanel';
import { useAccount } from '@/entities/Account/api/useAccount';
import { Loader } from '@/shared/ui';
import { useMeMember } from '@/entities/AccountMember/api/useMeMember';

export const AccountPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: number }>();

  const {
    account,
    isLoading: accountLoading,
    error: accountError,
  } = useAccount(accountId);

  const {
    meMember,
    isLoading: memberLoading,
    error: memberError,
  } = useMeMember(accountId);

  return (
    <div className="w-full">
      <Link href="/">На главную</Link>
      <Loader
        className="size-30 m-auto"
        isLoading={accountLoading || memberLoading}
      />
      {!account && accountError && (
        <h1 className="text-center text-2xl text-red-500">
          Счёт с ID {accountId} не найден
        </h1>
      )}
      {!meMember && memberError && (
        <h1 className="text-center text-2xl text-red-500">
          У Вас нет прав на просмотр счёта
        </h1>
      )}
      {account && meMember && (
        <>
          <h1 className="text-center text-2xl mt-10">Счёт {account.name}</h1>
          <h2 className="text-lg my-6">{account.description}</h2>
          <MembersPanel className="w-full my-4" accountId={accountId} />
          <OpeartionsDashboard accountId={accountId} />
          <OperationDialogWindow />
        </>
      )}
    </div>
  );
};
