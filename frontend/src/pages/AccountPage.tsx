import clsx from 'clsx';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'wouter';

type FinNote = {
  name: string;
  value: number;
  date: Date;
};

type Account = {
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
        name: 'Доход с нефти',
        value: 100_000,
        date: new Date(1992, 0, 1),
      },
      {
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
  const [result, setResult] = useState<number>(0);
  const [notes, setNotes] = useState<FinNote[]>([]);

  useEffect(() => {
    const account = ACCOUNT_MOCKS.find((account) => account.id === accountId);
    if (!account) return;
    setAccount(account);
    setResult(
      account.notes
        .map((note) => note.value)
        .reduce((acc, val) => acc + val, 0),
    );
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
      <div className="flex justify-between items-center gap-2 mb-4">
        <div className="flex gap-1 justify-start items-center p-2 border">
          <span>С</span>
          <input
            className="p-1 bg-gray-100"
            type="date"
            name="date-from"
            id="date-from"
          />
          <span>по</span>
          <input
            className="p-1 bg-gray-100"
            type="date"
            name="date-to"
            id="date-to"
          />
        </div>
        <div className="flex gap-4 justify-end p-2 border">
          <button className="p-1 px-3 bg-gray-200 hover:bg-gray-300">
            Текщий месяц
          </button>
          <button className="p-1 px-3 bg-gray-200 hover:bg-gray-300">
            Следующий месяц
          </button>
          <button className="p-1 px-3 bg-gray-200 hover:bg-gray-300">
            Текущий год
          </button>
        </div>
      </div>
      <div className="flex gap-2 justify-start items-center mb-2">
        <span>Итого:</span>
        <span
          className={clsx(
            'font-mono p-1',
            result > 0 && 'bg-green-300',
            result === 0 && 'bg-yellow-200',
            result < 0 && 'bg-red-300',
          )}
        >
          {result}
        </span>
      </div>
      <div className="grid grid-cols-3">
        <span>Дата</span>
        <span>Название</span>
        <span>Значение</span>
        {notes.map((note) => (
          <>
            <span>{note.date.toDateString()}</span>
            <span>{note.name}</span>
            <span>{note.value}</span>
          </>
        ))}
      </div>
    </div>
  );
};
