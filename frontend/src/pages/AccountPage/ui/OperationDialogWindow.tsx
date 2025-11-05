import type React from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import clsx from 'clsx';

import { useOperationDialogStore } from '../model';
import { Button } from '@/shared/ui';

export const OperationDialogWindow: React.FC = () => {
  const operation = useOperationDialogStore((state) => state.operation);
  const opened = useOperationDialogStore((state) => state.opened);
  const close = useOperationDialogStore((state) => state.close);

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
          <DialogTitle as="h3" className="text-lg font-medium">
            {operation.description}
          </DialogTitle>
          <div className="mt-2 text-lg">
            Дата: {operation.date.toLocaleDateString()}
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
            <Button className="px-2" onClick={close}>
              Изменить
            </Button>
            <Button className="px-2" onClick={close}>
              Удалить
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
