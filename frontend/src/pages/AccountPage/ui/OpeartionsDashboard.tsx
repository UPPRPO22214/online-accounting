import clsx from 'clsx';
import { useEffect, type HTMLAttributes } from 'react';
import type React from 'react';

import { Button } from '@/shared/ui';
import { OperationsCommonStats } from './OperationsCommonStats';
import { OperationsTable } from './OperationsTable';
import { useAccountOperationsStore } from '../model';
import { useTransactions } from '@/entities/Operation';

type OpeartionsDashboardProps = HTMLAttributes<HTMLDivElement> & {
  accountId: number;
};

export const OpeartionsDashboard: React.FC<OpeartionsDashboardProps> = ({
  accountId,
  className,
  ...props
}) => {
  const setOperations = useAccountOperationsStore((state) => state.set);

  const { transactions } = useTransactions(accountId);
  useEffect(() => {
    if (!transactions) return;
    setOperations(
      transactions.map((value) => ({
        amount: value.amount,
        date: value.occurred_at,
      })),
    );
  }, [transactions, setOperations]);

  return (
    <div className={clsx('', className)} {...props}>
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
          <Button className="px-3">Текщий месяц</Button>
          <Button className="px-3">Следующий месяц</Button>
          <Button className="px-3">Текущий год</Button>
        </div>
      </div>
      <OperationsCommonStats className="my-2" />
      <OperationsTable accountId={accountId} />
    </div>
  );
};
