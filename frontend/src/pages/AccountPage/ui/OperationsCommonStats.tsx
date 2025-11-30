import { type HTMLAttributes } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

import clsx from 'clsx';
import { Button } from '@/shared/ui/Button';
import { OperationsChart } from './OperationsChart';
import { useAccountOperationsStore } from '../model';

type OperationsCommonStatsProps = HTMLAttributes<HTMLDivElement>;

export const OperationsCommonStats: React.FC<OperationsCommonStatsProps> = ({
  className,
  ...props
}) => {
  const totalAmount = useAccountOperationsStore((state) => state.totalAmount);

  return (
    <div
      className={clsx('flex justify-start items-center gap-x-2', className)}
      {...props}
    >
      <div className="flex gap-2 justify-start items-center">
        <span>Итого:</span>
        <span
          className={clsx(
            'font-mono p-1',
            totalAmount > 0 && 'bg-green-300',
            totalAmount === 0 && 'bg-yellow-200',
            totalAmount < 0 && 'bg-red-300',
          )}
        >
          {totalAmount}
        </span>
      </div>
      <Popover>
        <PopoverButton
          as={Button}
          className="flex justify-start items-center gap-x-2 group data-open:border-1 cursor-pointer"
        >
          <span>Гистпограмма</span>
          <ChevronDownIcon className="transition-base w-5 data-openend::rotate-180 group-data-open:rotate-180" />
        </PopoverButton>
        <PopoverPanel
          className={clsx(
            'w-1/2 p-2 bg-white border-2',
            'transition-base ease-out data-closed:-translate-y-6 data-closed:opacity-0',
          )}
          transition
          anchor="bottom"
        >
          <OperationsChart title="Гистограмма доходов и расходов по дням" variant="separate" type="bar" />
        </PopoverPanel>
      </Popover>
      <Popover>
        <PopoverButton
          as={Button}
          className="flex justify-start items-center gap-x-2 group data-open:border-1 cursor-pointer"
        >
          <span>График</span>
          <ChevronDownIcon className="transition-base w-5 data-openend::rotate-180 group-data-open:rotate-180" />
        </PopoverButton>
        <PopoverPanel
          className={clsx(
            'w-1/2 p-2 bg-white border-2',
            'transition-base ease-out data-closed:-translate-y-6 data-closed:opacity-0',
          )}
          transition
          anchor="bottom"
        >
          <OperationsChart title="Накопительный график доходов и расходов" variant="accumulate" type="line" />
        </PopoverPanel>
      </Popover>
    </div>
  );
};
