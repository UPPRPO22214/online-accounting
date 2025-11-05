import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'wouter';

import { OperationsTable } from './OperationsTable';
import { OperationDialogWindow } from './OperationDialogWindow';
import { useAuthStore, type User } from '@/entities/User';
import { getAccount, type Account } from '@/entities/Account';

export const AccountPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const [account, setAccount] = useState<Account>();

  const user = useAuthStore((state) => state.user);
  const [members, setMembers] = useState<User[]>([]);

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
      <div className="flex justify-start items-center gap-2 text-xl mb-6">
        <h2 className="">{account.id}</h2>
        <span>+</span>
        <ul className="text-lg flex justify-start gap-2">
          {members.map((member) => (
            <li key={member.id}>{member.nickname}</li>
          ))}
        </ul>
      </div>
      <OperationsTable accountId={accountId} />
      <OperationDialogWindow />
    </div>
  );
};
