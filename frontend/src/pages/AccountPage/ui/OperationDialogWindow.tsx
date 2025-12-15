import type React from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Label,
  Select,
  Transition,
  Checkbox,
} from '@headlessui/react';
import clsx from 'clsx';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'wouter';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useOperationDialogStore } from '../model';
import { Button, ErrorMessage, Loader } from '@/shared/ui';
import {
  operationCreateSchema,
  operationEditSchema,
  type OperationCreateFormType,
  type OperationEditFormType,
} from '../types/operationFormTypes';
import { periodsLabels, type Period } from '@/entities/Operation/types';
import { checkRole, type MemberRole } from '@/entities/AccountMember';
import {
  useTransactionCreate,
  useTransactionDelete,
} from '@/entities/Operation';
import { useMeMember } from '@/entities/AccountMember/api';
import { isoDateToDate } from '@/shared/types';
import { useTransactionUpdate } from '@/entities/Operation/api';

export const OperationDialogWindow: React.FC = () => {
  const { accountId } = useParams<{ accountId: number }>();
  const operation = useOperationDialogStore((state) => state.operation);
  const mode = useOperationDialogStore((state) => state.mode);
  const setMode = useOperationDialogStore((state) => state.setMode);
  const opened = useOperationDialogStore((state) => state.opened);
  const close = useOperationDialogStore((state) => state.close);

  const [defaultOperation, setDefaultOperation] =
    useState<OperationCreateFormType>();
  const {
    register: createRegister,
    formState: createState,
    handleSubmit: handleSubmitCreate,
    control: controlCreate,
  } = useForm<OperationCreateFormType>({
    resolver: zodResolver(operationCreateSchema),
    values: defaultOperation,
  });
  const {
    register: editRegister,
    formState: editState,
    handleSubmit: handleSubmitEdit,
    control: controlEdit,
  } = useForm<OperationEditFormType>({
    resolver: zodResolver(operationEditSchema),
    values: defaultOperation,
  });
  useEffect(() => {
    const defaultOpeationValues: OperationCreateFormType = {
      title: operation.title,
      amount: operation.amount,
      occurred_at: operation.occurred_at,
      period: operation.period as Period | undefined,
    };
    setIsPeriodic(!!operation.period);
    setDefaultOperation(defaultOpeationValues);
  }, [operation]);

  const amountCreate = useWatch({
    name: 'amount',
    control: controlCreate,
  });

  const amountEdit = useWatch({
    name: 'amount',
    control: controlEdit,
  });
  const [isPeriodic, setIsPeriodic] = useState(false);

  const {
    createTransaction,
    isPending: createPending,
    error: createError,
  } = useTransactionCreate(accountId, () => {
    close();
  });
  const {
    updateTransaction,
    isPending: updatePending,
    error: updateError,
  } = useTransactionUpdate(accountId, operation.id, () => {
    close();
  });
  const {
    deleteTransaction,
    isPending: deletePending,
    error: deleteError,
  } = useTransactionDelete(accountId, operation.id, () => {
    close();
  });

  const { meMember } = useMeMember(accountId);

  const canChange = useMemo(
    () =>
      (checkRole(meMember?.role as MemberRole, 'editor') &&
        (operation.user_id === meMember?.user_id || mode === 'create')) ||
      checkRole(meMember?.role as MemberRole, 'admin'),
    [meMember, mode, operation.user_id],
  );

  return (
    <Dialog
      as="div"
      className="relative z-10 focus:outline-none"
      open={opened}
      onClose={close}
    >
      <div
        className={clsx(
          'flex items-center justify-center',
          'fixed inset-0 z-10',
          'min-h-full w-screen overflow-y-auto',
          'backdrop-blur-xs',
        )}
      >
        <DialogPanel
          transition
          className={clsx(
            'w-full max-w-md border-2 p-6 bg-white',
            'transition-base ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0',
          )}
        >
          {mode === 'show' && (
            <>
              <DialogTitle as="h3" className="text-lg font-medium">
                {operation.title}
              </DialogTitle>
              <div className="mt-2 text-lg">
                Дата:{' '}
                {operation.occurred_at &&
                  isoDateToDate
                    .decode(operation.occurred_at.split('T')[0])
                    .toLocaleDateString()}
              </div>
              <div className="mt-2 text-lg">
                Сумма:{' '}
                <span
                  className={clsx(
                    'font-mono p-1',
                    operation.amount > 0 && 'bg-green-300',
                    operation.amount === 0 && 'bg-yellow-200',
                    operation.amount < 0 && 'bg-red-300',
                  )}
                >
                  {operation.amount}
                </span>
              </div>
              <div className="mt-4 flex justify-around">
                <Button className="px-2" onClick={close}>
                  Закрыть
                </Button>
                {canChange && (
                  <>
                    <Button className="px-2" onClick={() => setMode('edit')}>
                      Изменить
                    </Button>
                    <Button
                      className="px-2"
                      onClick={() => {
                        deleteTransaction();
                      }}
                    >
                      {deletePending ? <Loader /> : 'Удалить'}
                    </Button>
                  </>
                )}
              </div>
              <ErrorMessage message={deleteError?.message} />
            </>
          )}
          {canChange && mode === 'create' && (
            <form
              className="text-lg grid grid-cols-1 gap-2"
              onSubmit={handleSubmitCreate((state) => {
                if (!isPeriodic) delete state.period;
                state.occurred_at = isoDateToDate
                  .decode(state.occurred_at)
                  .toISOString();
                console.log(mode, state);
                createTransaction(state);
              })}
            >
              <Field className="flex justify-start items-center gap-x-2">
                <Label>Описание</Label>
                <input
                  className="font-medium p-1 bg-gray-100"
                  placeholder="Описание операции"
                  {...createRegister('title')}
                />
              </Field>
              <ErrorMessage message={createState.errors.title?.message} />
              <Field className="flex justify-start items-center gap-x-2">
                <Label>{isPeriodic ? 'Начальная дата' : 'Дата'}</Label>
                <input
                  className="p-1 bg-gray-100"
                  type="date"
                  {...createRegister('occurred_at')}
                />
              </Field>
              <ErrorMessage message={createState.errors.occurred_at?.message} />
              <Field className="flex justify-start items-center gap-x-2">
                <Label>Сумма</Label>
                <input
                  placeholder="Сумма операции"
                  type="number"
                  className={clsx(
                    'font-mono p-1 bg-gray-100 transition-base',
                    amountCreate > 0 && 'bg-green-300',
                    amountCreate === 0 && 'bg-yellow-200',
                    amountCreate < 0 && 'bg-red-300',
                  )}
                  {...createRegister('amount')}
                />
              </Field>
              <span className="text-sm">(может быть отрицательной)</span>
              <ErrorMessage message={createState.errors.amount?.message} />
              <div className="flex justify-start items-center gap-x-2">
                <span>Периодическая?</span>
                <Checkbox
                  className="cursor-pointer data-[checked]:bg-green-200 px-2"
                  checked={isPeriodic}
                  onChange={setIsPeriodic}
                  as={Button}
                >
                  {isPeriodic ? 'Да' : 'Нет'}
                </Checkbox>
              </div>
              <Transition show={isPeriodic}>
                <div className="grid grid-cols-1 gap-1 transition-base data-closed:opacity-0 data-closed:scale-0">
                  <Field className="flex justify-start items-center gap-x-2">
                    <Label>Период</Label>
                    <Select className="border-1" {...createRegister('period')}>
                      {/* <Select className="border-1"> */}
                      {Object.entries(periodsLabels).map(([period, label]) => (
                        <option label={label} value={period} key={period}>
                          {period}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
              </Transition>
              <div className="flex justify-around">
                <Button
                  className="px-2"
                  onClick={() => {
                    close();
                  }}
                >
                  Отмена
                </Button>
                <Button type="submit" className="px-2">
                  {createPending ? <Loader /> : 'Создать'}
                </Button>
              </div>
              <ErrorMessage
                message={
                  createState.errors.root?.message || createError?.message
                }
              />
            </form>
          )}
          {canChange && mode === 'edit' && (
            <form
              className="text-lg grid grid-cols-1 gap-2"
              onSubmit={handleSubmitEdit((state) => {
                state.occurred_at = isoDateToDate
                  .decode(state.occurred_at)
                  .toISOString();
                console.log(mode, state);
                updateTransaction(state);
              })}
            >
              <Field className="flex justify-start items-center gap-x-2">
                <Label>Описание</Label>
                <input
                  className="font-medium p-1 bg-gray-100"
                  placeholder="Описание операции"
                  {...editRegister('title')}
                />
              </Field>
              <ErrorMessage message={editState.errors.title?.message} />
              <Field className="flex justify-start items-center gap-x-2">
                <Label>{isPeriodic ? 'Начальная дата' : 'Дата'}</Label>
                <input
                  className="p-1 bg-gray-100"
                  type="date"
                  {...editRegister('occurred_at')}
                />
              </Field>
              <ErrorMessage message={editState.errors.occurred_at?.message} />
              <Field className="flex justify-start items-center gap-x-2">
                <Label>Сумма</Label>
                <input
                  placeholder="Сумма операции"
                  type="number"
                  className={clsx(
                    'font-mono p-1 bg-gray-100 transition-base',
                    amountEdit > 0 && 'bg-green-300',
                    amountEdit === 0 && 'bg-yellow-200',
                    amountEdit < 0 && 'bg-red-300',
                  )}
                  {...editRegister('amount')}
                />
              </Field>
              <span className="text-sm">(может быть отрицательной)</span>
              <ErrorMessage message={editState.errors.amount?.message} />
              <div className="flex justify-around">
                <Button
                  className="px-2"
                  onClick={() => {
                    setMode('show');
                  }}
                >
                  Отмена
                </Button>
                <Button type="submit" className="px-2">
                  {updatePending ? <Loader /> : 'Сохранить'}
                </Button>
              </div>
              <ErrorMessage
                message={editState.errors.root?.message || updateError?.message}
              />
            </form>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};
