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
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useOperationDialogStore } from '../model';
import { Button, ErrorMessage } from '@/shared/ui';
import {
  operationSchema,
  type OperationFormType,
} from '../types/operationFormTypes';
import { periodsLabels } from '@/entities/Operation/types';
import { checkRole, type MemberRole } from '@/entities/AccountMember';
import {
  useTransactionCreate,
  useTransactionDelete,
} from '@/entities/Operation';
import { useMeMember } from '@/entities/AccountMember/api';

export const OperationDialogWindow: React.FC = () => {
  const { accountId } = useParams<{ accountId: number }>();
  const operation = useOperationDialogStore((state) => state.operation);
  const mode = useOperationDialogStore((state) => state.mode);
  const setMode = useOperationDialogStore((state) => state.setMode);
  const opened = useOperationDialogStore((state) => state.opened);
  const close = useOperationDialogStore((state) => state.close);

  const [defaultOperation, setDefaultOperation] = useState<OperationFormType>();
  const { register, formState, handleSubmit, control } =
    useForm<OperationFormType>({
      resolver: zodResolver(operationSchema),
      values: defaultOperation,
    });
  useEffect(() => {
    const defaultOpeationValues: OperationFormType = {
      title: operation.title!,
      amount: Number.parseFloat(operation.amount!),
      occured_at: operation.occurred_at!,
      is_periodic: !!operation.is_periodic,
    };
    setIsPeriodic(!!operation.is_periodic);
    setDefaultOperation(defaultOpeationValues);
  }, [operation]);

  const amount = useWatch({
    name: 'amount',
    control,
  });
  const [isPeriodic, setIsPeriodic] = useState(false);

  const { createTransaction } = useTransactionCreate(accountId, () => {
    close();
  });
  const { deleteTransaction } = useTransactionDelete(
    accountId,
    operation.id!,
    () => {
      close();
    },
  );

  const { meMember } = useMeMember(accountId);

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
          {mode === 'show' ||
          !checkRole(meMember?.role as MemberRole, 'editor') ? (
            <>
              <DialogTitle as="h3" className="text-lg font-medium">
                {operation.title} - {operation.category}
              </DialogTitle>
              <div className="mt-2 text-lg">Дата: {operation.occurred_at}</div>
              <div className="mt-2 text-lg">
                Сумма:{' '}
                <span
                  className={clsx(
                    'font-mono p-1',
                    Number.parseFloat(operation.amount!) > 0 && 'bg-green-300',
                    Number.parseFloat(operation.amount!) === 0 &&
                      'bg-yellow-200',
                    Number.parseFloat(operation.amount!) < 0 && 'bg-red-300',
                  )}
                >
                  {operation.amount}
                </span>
              </div>
              <div className="mt-4 flex justify-around">
                <Button className="px-2" onClick={close}>
                  Закрыть
                </Button>
                {checkRole(meMember?.role as MemberRole, 'editor') && (
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
                      Удалить
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : (
            <form
              className="text-lg grid grid-cols-1 gap-2"
              onSubmit={handleSubmit((state) => {
                if (mode === 'create') {
                  createTransaction({ ...state, amount: `${state.amount}` });
                } else {
                  console.warn('IMPLEMENT UPDATE');
                  // editOperation(accountId, state);
                }
              })}
            >
              <Field className="flex justify-start items-center gap-x-2">
                <Label>Описание</Label>
                <input
                  className="font-medium p-1 bg-gray-100"
                  placeholder="Описание операции"
                  {...register('title')}
                />
              </Field>
              <ErrorMessage message={formState.errors.title?.message} />
              <Field className="flex justify-start items-center gap-x-2">
                <Label>Категория</Label>
                <input
                  className="font-medium p-1 bg-gray-100"
                  placeholder="Категория операции"
                  {...register('category')}
                />
              </Field>
              <ErrorMessage message={formState.errors.category?.message} />
              <Field className="flex justify-start items-center gap-x-2">
                <Label>{isPeriodic ? 'Начальная дата' : 'Дата'}</Label>
                <input
                  className="p-1 bg-gray-100"
                  type="date"
                  {...register('occured_at')}
                />
              </Field>
              <ErrorMessage message={formState.errors.occured_at?.message} />
              <Field className="flex justify-start items-center gap-x-2">
                <Label>Сумма</Label>
                <input
                  placeholder="Сумма операции"
                  type="number"
                  className={clsx(
                    'font-mono p-1 bg-gray-100 transition-base',
                    amount > 0 && 'bg-green-300',
                    amount === 0 && 'bg-yellow-200',
                    amount < 0 && 'bg-red-300',
                  )}
                  {...register('amount')}
                />
              </Field>
              <span className="text-sm">(может быть отрицательной)</span>
              <ErrorMessage message={formState.errors.amount?.message} />
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
                    {/* <Select className="border-1" {...register('period')}> */}
                    <Select className="border-1">
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
                    if (mode === 'create') {
                      close();
                    } else if (mode === 'edit') {
                      setMode('show');
                    }
                  }}
                >
                  Отмена
                </Button>
                <Button type="submit" className="px-2">
                  {mode === 'create' && 'Создать'}
                  {mode === 'edit' && 'Сохранить'}
                </Button>
              </div>
            </form>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};
