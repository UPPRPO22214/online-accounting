import clsx from 'clsx';
import { type HTMLAttributes } from 'react';
import type React from 'react';

import { useOperationDialogStore } from '../model';
import { Button } from '@/shared/ui';
import { OperationTableRow } from './OperationTableRow';
import { checkRole } from '@/entities/AccountMember';
import type { MemberRole } from '@/entities/AccountMember/types';
import { useMeMember } from '@/entities/AccountMember/api';
import type { HandlersTransactionResponse } from '@/shared/api';

type OperationsTableProps = HTMLAttributes<HTMLDivElement> & {
  accountId: number;
  transactions: HandlersTransactionResponse[];
};

export const OperationsTable: React.FC<OperationsTableProps> = ({
  accountId,
  transactions,
  className,
  ...props
}) => {

  const openNewOpeationDialog = useOperationDialogStore(
    (state) => state.openNew,
  );

  const { meMember } = useMeMember(accountId);

  return (
    <div className={clsx('grid grid-cols-1', className)} {...props}>
      <div className="p-1 border grid grid-cols-3">
        <span>Дата</span>
        <span>Название</span>
        <span>Значение</span>
      </div>
      {meMember && checkRole(meMember.role as MemberRole, 'editor') && (
        <Button
          className="cursor-pointer text-xl font-bold border border-t-0"
          variant="white"
          onClick={openNewOpeationDialog}
        >
          +
        </Button>
      )}
      {transactions.map((operation) => (
        <OperationTableRow key={operation.id} operation={operation} />
      ))}
    </div>
  );
};
