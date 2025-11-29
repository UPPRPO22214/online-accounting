import clsx from 'clsx';
import { useEffect, useState, type HTMLAttributes } from 'react';
import type React from 'react';
import { useOperationDialogStore } from '../model';
import { getAmountColorClass } from '@/shared/ui/getAmountColorClsss';
import { getOperation, type Operation } from '@/entities/Operation';

type OperationsTableProps = HTMLAttributes<HTMLButtonElement> & {
  operationId: string;
};

export const OperationTableRow: React.FC<OperationsTableProps> = ({
  operationId,
  ...props
}) => {
  const openOperationDialog = useOperationDialogStore((state) => state.open);
  const [operation, setOperation] = useState<Operation>();
  const [amountColor, setAmountColor] = useState<string>();

  useEffect(() => {
    const operation = getOperation(operationId);
    if (!operation) return;
    setOperation(operation);
    setAmountColor(getAmountColorClass(operation.amount));
  }, [operationId]);

  return (
    <button
      className={clsx(
        'grid grid-cols-3',
        'border border-t-0 cursor-pointer',
        'transition-base hover:bg-gray-300',
      )}
      onClick={() => {
        if (operation) openOperationDialog(operation);
      }}
      {...props}
    >
      {operation ? (
        <>
          <span className="p-1">{operation.date}</span>
          <span className="p-1 border-x">{operation.description}</span>
          <span className={clsx('font-mono p-1', amountColor)}>
            {operation.amount}
          </span>
        </>
      ) : (
        <span>Загрузка...</span>
      )}
    </button>
  );
};
