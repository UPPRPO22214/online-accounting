import clsx from 'clsx';
import { useEffect, useState, type HTMLAttributes } from 'react';
import type React from 'react';

import { useAccountOperationsStore, useOperationDialogStore } from '../model';
import { Button } from '@/shared/ui';
import { OperationTableRow } from './OperationTableRow';
import {
  checkRole,
  getMyRole,
  type AccountMember,
} from '@/entities/AccountMember';

type OperationsTableProps = HTMLAttributes<HTMLDivElement> & {
  accountId: number;
};

export const OperationsTable: React.FC<OperationsTableProps> = ({
  accountId,
  className,
  ...props
}) => {
  const operations = useAccountOperationsStore((state) => state.operations);

  const openNewOpeationDialog = useOperationDialogStore(
    (state) => state.openNew,
  );

  const [meMember, setMeMember] = useState<AccountMember>();
  useEffect(() => {
    setMeMember(getMyRole(accountId));
  }, [accountId]);

  return (
    <div className={clsx('grid grid-cols-1', className)} {...props}>
      <div className="p-1 border grid grid-cols-3">
        <span>Дата</span>
        <span>Название</span>
        <span>Значение</span>
      </div>
      {meMember && checkRole(meMember.role, 'contributor') && (
        <Button
          className="cursor-pointer text-xl font-bold border border-t-0"
          variant="white"
          onClick={openNewOpeationDialog}
        >
          +
        </Button>
      )}
      {operations.map((operation) => (
        <OperationTableRow key={operation.id} operation={operation} />
      ))}
    </div>
  );
};
