import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'wouter';

import { FinTable } from './FinTable';
import { FinDialog } from './FinDialog';

export type FinNote = {
  id: string;
  name: string;
  value: number;
  date: Date;
};

export type Account = {
  id: string;
  title: string;
  owner: string;
  members: string[];
  notes: FinNote[];
};

const ACCOUNT_MOCKS: Account[] = [
  {
    id: '1',
    title: 'Шоковая терапия',
    owner: 'Гайдар',
    members: ['Ельцын', 'Чубайс'],
    notes: [
      {
        id: crypto.randomUUID(),
        name: 'Доход с нефти',
        value: 100_000,
        date: new Date(1992, 0, 1),
      },
      {
        id: crypto.randomUUID(),
        name: 'Выплаты по ГКО',
        value: -10_000,
        date: new Date(1992, 1, 1),
      },
    ],
  },
];

export const AccountPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const [account, setAccount] = useState<Account>();
  const [notes, setNotes] = useState<FinNote[]>([]);

  useEffect(() => {
    const account = ACCOUNT_MOCKS.find((account) => account.id === accountId);
    if (!account) return;
    setAccount(account);
    setNotes(
      account.notes.toSorted((a, b) => a.date.getTime() - b.date.getTime()),
    );
  }, [accountId]);

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
        <h2 className="">{account.owner}</h2>
        <span>+</span>
        <ul className="text-lg flex justify-start gap-2">
          {account.members.map((member) => (
            <li key={member}>{member}</li>
          ))}
        </ul>
      </div>
      <FinTable notes={notes} />
      <FinDialog />
    </div>
  );
};
