import type React from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";

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
    id: "1",
    title: "Шоковая терапия",
    owner: "Гайдар",
    members: ["Ельцын", "Чубайс"],
    notes: [
      {
        name: "Доход с нефти",
        value: 100_000,
        date: new Date(1992, 0, 1),
      },
      {
        name: "Выплаты по ГКО",
        value: -10_000,
        date: new Date(1992, 1, 1),
      },
    ],
  },
];

export const AccountPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const [account, setAccount] = useState<Account>();

  useEffect(() => {
    const account = ACCOUNT_MOCKS.find((account) => account.id === accountId);
    if (!account) return;
    setAccount(account);
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
      <h2 className="text-xl text-center">Владелец: {account.owner}</h2>
      <div className="text-lg">
        <h3>Участники:</h3>
        <ul>
          {account.members.map((member) => (
            <li key={member}>{member}</li>
          ))}
        </ul>
      </div>
      <div className="">
        <p>
          Тут будут параметры фильтрации: начальная дата, конечная, быстрые
          кнопки для выбора текущего и следующего месяца, текущего года
        </p>
      </div>
      <div className="">
        <p>
          Здесь будут таблица, где в верхнем ряду сводные данные, а далее все
          записи
        </p>
      </div>
    </div>
  );
};
