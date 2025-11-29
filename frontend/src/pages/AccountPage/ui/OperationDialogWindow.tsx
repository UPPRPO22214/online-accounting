import type React from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Label,
  Select,
  Transition,
} from '@headlessui/react';
import { Checkbox } from '@headlessui/react';
import clsx from 'clsx';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'wouter';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useOperationDialogStore } from '../model';
import { Button, ErrorMessage } from '@/shared/ui';
import {
  createOperation,
  deleteOperation,
  editOperation,
} from '@/entities/Operation/api';
import { operationSchema, type OperationFormType } from '../types';
import { periods, type Operation } from '@/entities/Operation/types';

export const OperationDialogWindow: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
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
      description: operation.description,
      amount: operation.amount,
      date: operation.date,
      period: operation.periodic?.period,
      ended_at: operation.periodic?.ended_at,
    };
    setIsPeriodic(!!operation.periodic);
    setDefaultOperation(defaultOpeationValues);
  }, [operation]);

  const amount = useWatch({
    name: 'amount',
    control,
  });
  const [isPeriodic, setIsPeriodic] = useState(false);

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
          {mode === 'show' ? (
            <>
              <DialogTitle as="h3" className="text-lg font-medium">
                {operation.description}
              </DialogTitle>
              <div className="mt-2 text-lg">Дата: {operation.date}</div>
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
                <Button className="px-2" onClick={() => setMode('edit')}>
                  Изменить
                </Button>
                <Button
                  className="px-2"
                  onClick={() => {
                    deleteOperation(operation.id, accountId);
                    close();
                    location.reload();
                  }}
                >
                  Удалить
                </Button>
              </div>
            </>
          ) : (
            <form
              className="text-lg grid grid-cols-1 gap-2"
              onSubmit={handleSubmit((state) => {
                const newOperation: Operation = {
                  amount: state.amount,
                  description: state.description,
                  date: state.date,
                  id: mode === 'create' ? crypto.randomUUID() : operation.id,
                  periodic:
                    isPeriodic && state.period
                      ? {
                          period: state.period,
                          started_at: state.date,
                          ended_at:
                            state.ended_at && state.ended_at !== ''
                              ? state.ended_at
                              : undefined,
                        }
                      : undefined,
                };
                if (mode === 'create') {
                  createOperation(accountId, newOperation);
                } else {
                  editOperation(newOperation);
                }
                close();
                location.reload();
              })}
            >
              <input
                className="font-medium p-1 bg-gray-100"
                placeholder="Описание операции"
                {...register('description')}
              />
              <ErrorMessage message={formState.errors.description?.message} />
              <input
                className="p-1 bg-gray-100"
                type="date"
                {...register('date')}
              />
              <ErrorMessage message={formState.errors.date?.message} />
              <input
                placeholder="Сумма операции"
                className={clsx(
                  'font-mono p-1 bg-gray-100 transition-base',
                  amount > 0 && 'bg-green-300',
                  amount === 0 && 'bg-yellow-200',
                  amount < 0 && 'bg-red-300',
                )}
                {...register('amount')}
              />
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
                  <Field>
                    <Label>Период</Label>
                    <Select {...register('period')}>
                      {periods.map((period) => (
                        <option value={period} key={period}>
                          {period}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <ErrorMessage message={formState.errors.period?.message} />
                  <input
                    className="p-1 bg-gray-100"
                    type="date"
                    {...register('ended_at')}
                  />
                  <ErrorMessage message={formState.errors.ended_at?.message} />
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
