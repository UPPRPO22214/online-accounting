import clsx from 'clsx';
import { useEffect, useState, type HTMLAttributes } from 'react';
import type React from 'react';
import { useOperationDialogStore } from '../model';
import { getAmountColorClass } from '@/shared/ui/getAmountColorClsss';
import { type Operation } from '@/entities/Operation';
import { isoDateToDate } from '@/shared/types';

type OperationsTableProps = HTMLAttributes<HTMLButtonElement> & {
  operation: Operation;
};

export const OperationTableRow: React.FC<OperationsTableProps> = ({
  operation,
  ...props
}) => {
  const openOperationDialog = useOperationDialogStore((state) => state.open);
  const [amountColor, setAmountColor] = useState<string>();

  useEffect(() => {
    setAmountColor(getAmountColorClass(operation.amount));
  }, [operation]);

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
          <span className="p-1">
            {isoDateToDate.decode(operation.date).toLocaleDateString()}
          </span>
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
