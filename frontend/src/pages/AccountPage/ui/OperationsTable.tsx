import clsx from 'clsx';
import { useEffect, useState, type HTMLAttributes } from 'react';
import type React from 'react';

import { useOperationDialogStore } from '../model';
import { Button } from '@/shared/ui';
import { getAccountOperations, type Operation } from '@/entities/Operation';
import { OperationTableRow } from './OperationTableRow';
import { OperationsChart } from './OperationsChart';

type OperationsTableProps = HTMLAttributes<HTMLDivElement> & {
  accountId: string;
};

export const OperationsTable: React.FC<OperationsTableProps> = ({
  accountId,
  ...props
}) => {
  const [result, setResult] = useState<number>(0);
  const openNewOpeationDialog = useOperationDialogStore(
    (state) => state.openNew,
  );
  const [operations, setOperations] = useState<Operation[]>([]);

  useEffect(() => {
    // TODO: Добавить тест
    const operations = getAccountOperations(accountId)
      .sort((a, b) => {
        if (a.date > b.date) return 1;
        else if (a.date < b.date) return -1;
        else return 0;
      });
    let result = 0;
    for (const operation of operations) {
      result += operation.amount;
    }

    setResult(result);
    setOperations(operations);
  }, [accountId]);

  useEffect(() => {}, [operations]);

  return (
    <div {...props}>
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
      <OperationsChart
        operations={operations}
        type="line"
        variant="accumulate"
      />
      <div className="grid grid-cols-1">
        <div className="p-1 border grid grid-cols-3">
          <span>Дата</span>
          <span>Название</span>
          <span>Значение</span>
        </div>
        <Button
          className="cursor-pointer text-xl font-bold border border-t-0"
          variant="white"
          onClick={openNewOpeationDialog}
        >
          +
        </Button>
        {operations.map((operation) => (
          <OperationTableRow key={operation.id} operation={operation} /> // Надо подумать, стоит ли сюда передавать целиком операцию или всё же по ID получаем внутри
        ))}
      </div>
    </div>
  );
};
