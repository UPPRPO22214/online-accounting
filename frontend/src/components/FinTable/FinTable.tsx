import type { FinNote } from '@/pages/AccountPage';
import { useFinDialog } from '@/state';
import clsx from 'clsx';
import { useEffect, useState, type HTMLAttributes } from 'react';
import type React from 'react';
import { Button } from '@/components/Button';

type FinTableProps = HTMLAttributes<HTMLDivElement> & {
  notes: FinNote[];
};

export const FinTable: React.FC<FinTableProps> = ({ notes, ...props }) => {
  const [result, setResult] = useState<number>(0);
  const openFinDialog = useFinDialog((state) => state.actions.open);

  useEffect(() => {
    setResult(
      notes.map((note) => note.value).reduce((acc, val) => acc + val, 0),
    );
  }, [notes]);

  return (
    <div {...props}>
      <div className="flex justify-between items-center gap-2 mb-4">
        <div className="flex gap-1 justify-start items-center p-2 border">
          <span>С</span>
          <input
            className="p-1 bg-gray-100"
            type="date"
            name="date-from"
            id="date-from"
          />
          <span>по</span>
          <input
            className="p-1 bg-gray-100"
            type="date"
            name="date-to"
            id="date-to"
          />
        </div>
        <div className="flex gap-4 justify-end p-2 border">
          <Button className="px-3">Текщий месяц</Button>
          <Button className="px-3">Следующий месяц</Button>
          <Button className="px-3">Текущий год</Button>
        </div>
      </div>
      <div className="flex gap-2 justify-start items-center mb-2">
        <span>Итого:</span>
        <span
          className={clsx(
            'font-mono p-1',
            result > 0 && 'bg-green-300',
            result === 0 && 'bg-yellow-200',
            result < 0 && 'bg-red-300',
          )}
        >
          {result}
        </span>
      </div>
      <div className="grid grid-cols-1">
        <div className="p-1 border grid grid-cols-3">
          <span>Дата</span>
          <span>Название</span>
          <span>Значение</span>
        </div>
        <Button
          className="cursor-pointer text-xl font-bold border border-t-0"
          variant="white"
          onClick={() => openFinDialog('new')}
        >
          +
        </Button>
        {notes.map((note) => (
          <button
            key={note.id}
            className={clsx(
              'grid grid-cols-3',
              'border border-t-0 cursor-pointer',
              'transition-base hover:bg-gray-300',
            )}
            onClick={() => openFinDialog(note)}
          >
            <span className="p-1">{note.date.toLocaleDateString()}</span>
            <span className="p-1 border-x">{note.name}</span>
            <span
              className={clsx(
                'font-mono p-1',
                note.value > 0 && 'bg-green-300',
                note.value === 0 && 'bg-yellow-200',
                note.value < 0 && 'bg-red-300',
              )}
            >
              {note.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
