import clsx from 'clsx';
import { useEffect, useState, type HTMLAttributes } from 'react';
import type React from 'react';

import { Button } from '@/shared/ui';
import { OperationsCommonStats } from './OperationsCommonStats';
import { OperationsTable } from './OperationsTable';
import { useAccountOperationsStore } from '../model';
import { useTransactions } from '@/entities/Operation';
import {
  type HandlersTransactionResponse,
} from '@/shared/api';
import { isoDateToDate } from '@/shared/types';

type OpeartionsDashboardProps = HTMLAttributes<HTMLDivElement> & {
  accountId: number;
};

export const OpeartionsDashboard: React.FC<OpeartionsDashboardProps> = ({
  accountId,
  className,
  ...props
}) => {
  const setOperations = useAccountOperationsStore((state) => state.set);

  const [dateFrom, setDateFrom] = useState<string>();
  const [dateTo, setDateTo] = useState<string>();
  const [type, setType] = useState<'income' | 'expense'>();
  const { transactions } = useTransactions(accountId, {
    date_from: dateFrom && isoDateToDate.decode(dateFrom).toISOString(),
    date_to: dateTo && isoDateToDate.decode(dateTo).toISOString(),
    type,
  });
  const [sortedTransactions, setSortedTransactions] = useState<
    HandlersTransactionResponse[]
  >([]);
  useEffect(() => {
    if (!transactions) return;
    setSortedTransactions(
      transactions.toSorted((a, b) => {
        if (a.occurred_at > b.occurred_at) return 1;
        else if (a.occurred_at < b.occurred_at) return -1;
        else return 0;
      }),
    );
  }, [transactions]);

  useEffect(() => {
    setOperations(
      sortedTransactions.map((value) => ({
        amount: value.amount,
        date: value.occurred_at,
      })),
    );
  }, [sortedTransactions, setOperations]);

  return (
    <div className={clsx('', className)} {...props}>
      <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
        <div className="flex gap-1 justify-start items-center p-2 border">
          <span>С</span>
          <input
            className={clsx(
              'p-1 bg-gray-100',
              dateFrom && 'bg-gray-300 border-1',
            )}
            type="date"
            name="date-from"
            id="date-from"
            value={dateFrom || ''}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span>по</span>
          <input
            className={clsx(
              'p-1 bg-gray-100',
              dateTo && 'bg-gray-300 border-1',
            )}
            type="date"
            name="date-to"
            id="date-to"
            value={dateTo || ''}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <Button
            className="px-3"
            onClick={() => {
              const now = new Date();
              const date = new Date(now.getFullYear(), now.getMonth(), 2);
              setDateFrom(isoDateToDate.encode(date));
              const newDate = new Date(
                date.getFullYear(),
                date.getMonth() + 1,
                1,
              );
              setDateTo(isoDateToDate.encode(newDate));
            }}
          >
            Текщий месяц
          </Button>
          <Button
            className="px-3"
            onClick={() => {
              const now = new Date();
              const date = new Date(now.getFullYear(), now.getMonth() + 1, 1);
              setDateFrom(isoDateToDate.encode(date));
              const newDate = new Date(
                date.getFullYear(),
                date.getMonth() + 1,
                1,
              );
              setDateTo(isoDateToDate.encode(newDate));
            }}
          >
            Следующий месяц
          </Button>
          <Button
            className="px-3"
            onClick={() => {
              const now = new Date();
              const date = new Date(now.getFullYear(), 0, 2);
              setDateFrom(isoDateToDate.encode(date));
              const newDate = new Date(date.getFullYear(), 12, 1);
              setDateTo(isoDateToDate.encode(newDate));
            }}
          >
            Текущий год
          </Button>
        </div>
        <div className="flex gap-4 justify-end p-2 border">
          <Button
            className={clsx(
              'transition-base',
              type === 'income' && 'bg-gray-300 border-1',
            )}
            onClick={() => setType((current) => current === 'income' ? undefined : 'income')}
          >
            Только доходы
          </Button>
          <Button
            className={clsx(
              'transition-base',
              type === 'expense' && 'bg-gray-300 border-1',
            )}
            onClick={() => setType((current) => current === 'expense' ? undefined : 'expense')}
          >
            Только расходы
          </Button>
        </div>
        <Button
          className="p-2"
          onClick={() => {
            setDateFrom(undefined);
            setDateTo(undefined);
            setType(undefined);
          }}
        >
          Сбросить
        </Button>
      </div>
      <OperationsCommonStats className="my-2" />
      <OperationsTable
        accountId={accountId}
        transactions={sortedTransactions}
      />
    </div>
  );
};
