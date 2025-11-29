import clsx from 'clsx';
import { useEffect, useState, type HTMLAttributes } from 'react';
import type React from 'react';

import { useOperationDialogStore } from '../model';
import { Button } from '@/shared/ui';
import { getAccountOperations, getOperation } from '@/entities/Operation';
import { OperationTableRow } from './OperationTableRow';

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
  const [operationIds, setOperationIds] = useState<string[]>([]);

  useEffect(() => {
    setOperationIds(getAccountOperations(accountId));
  }, [accountId]);

  useEffect(() => {
    for (const id of operationIds) {
      const amount = getOperation(id)?.amount;
      if (!amount) continue;
      setResult((value) => value + amount);
    }
  }, [operationIds]);

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
        {operationIds.map((id) => (
          <OperationTableRow key={id} operationId={id} />
        ))}
      </div>
    </div>
  );
};
