import clsx from 'clsx';
import { type HTMLAttributes } from 'react';
import type React from 'react';

import { useAccountOperationsStore, useOperationDialogStore } from '../model';
import { Button } from '@/shared/ui';
import { OperationTableRow } from './OperationTableRow';

type OperationsTableProps = HTMLAttributes<HTMLDivElement>;

export const OperationsTable: React.FC<OperationsTableProps> = ({
  className,
  ...props
}) => {
  const operations = useAccountOperationsStore((state) => state.operations);

  const openNewOpeationDialog = useOperationDialogStore(
    (state) => state.openNew,
  );

  return (
    <div className={clsx('grid grid-cols-1', className)} {...props}>
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
        <OperationTableRow key={operation.id} operation={operation} />
      ))}
    </div>
  );
};
