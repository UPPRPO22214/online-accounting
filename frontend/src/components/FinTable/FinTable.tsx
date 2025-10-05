import type { FinNote } from '@/pages/AccountPage';
import clsx from 'clsx';
import { useEffect, useState, type HTMLAttributes } from 'react';
import type React from 'react';

type FinTableProps = HTMLAttributes<HTMLDivElement> & {
  notes: FinNote[];
};

export const FinTable: React.FC<FinTableProps> = ({ notes, className }) => {
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    setResult(
      notes.map((note) => note.value).reduce((acc, val) => acc + val, 0),
    );
  }, [notes]);

  return (
    <div className={className}>
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
          <button className="p-1 px-3 bg-gray-200 hover:bg-gray-300">
            Текщий месяц
          </button>
          <button className="p-1 px-3 bg-gray-200 hover:bg-gray-300">
            Следующий месяц
          </button>
          <button className="p-1 px-3 bg-gray-200 hover:bg-gray-300">
            Текущий год
          </button>
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
        {notes.map((note) => (
          <div
            key={note.id}
            className={clsx(
              'grid grid-cols-3',
              'border border-t-0 cursor-pointer',
              'transition-base hover:bg-gray-300',
            )}
          >
            <span className='p-1'>{note.date.toDateString()}</span>
            <span className='p-1 border-x'>{note.name}</span>
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
          </div>
        ))}
      </div>
    </div>
  );
};
