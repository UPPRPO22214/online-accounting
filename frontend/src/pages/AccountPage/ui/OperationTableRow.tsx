import clsx from 'clsx';
import { useEffect, useState, type HTMLAttributes } from 'react';
import type React from 'react';
import { useOperationDialogStore } from '../model';
import { getAmountColorClass } from '@/shared/ui/getAmountColorClass';
import { isoDateToDate } from '@/shared/types';
import type { HandlersTransactionResponse } from '@/shared/api';

type OperationsTableProps = HTMLAttributes<HTMLButtonElement> & {
  operation: HandlersTransactionResponse;
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
            {isoDateToDate
              .decode(operation.occurred_at.split('T')[0])
              .toLocaleDateString()}
          </span>
          <span className="p-1 border-x">{operation.title}</span>
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
