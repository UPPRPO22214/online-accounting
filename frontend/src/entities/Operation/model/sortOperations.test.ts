import { isoDateToDate } from '@/shared/types';
import type { Operation } from '../types';
import { sortOperations } from './sortOperations';
import { describe, expect, test } from 'vitest';

describe('Sort operations tests', () => {
  test('Empty', () => {
    expect(sortOperations([])).length(0);
  });

  test('One', () => {
    const operations: Operation[] = [
      {
        id: '',
        date: isoDateToDate.encode(new Date()),
        amount: 0,
        description: '',
      },
    ];
    expect(sortOperations(operations)).toStrictEqual(operations);
  });

  test('Two same', () => {
    const date = isoDateToDate.encode(new Date());
    const operations: Operation[] = [
      {
        id: 'a',
        date: date,
        amount: 1,
        description: 'descritpion a',
      },
      {
        id: 'b',
        date: date,
        amount: 2,
        description: 'description b',
      },
    ];
    expect(sortOperations(operations)).toStrictEqual(operations);
  });

  test('Unchanged', () => {
    const date1 = isoDateToDate.encode(new Date(2025, 11, 11));
    const date2 = isoDateToDate.encode(new Date(2025, 11, 12));
    const operations: Operation[] = [
      {
        id: 'a',
        date: date1,
        amount: 1,
        description: 'descritpion a',
      },
      {
        id: 'b',
        date: date2,
        amount: 2,
        description: 'description b',
      },
    ];
    expect(sortOperations(operations)).toStrictEqual(operations);
  });

  test('Normal', () => {
    const date1 = isoDateToDate.encode(new Date(2025, 11, 11));
    const date2 = isoDateToDate.encode(new Date(2025, 11, 12));
    const operations: Operation[] = [
      {
        id: 'a',
        date: date2,
        amount: 1,
        description: 'descritpion a',
      },
      {
        id: 'b',
        date: date1,
        amount: 2,
        description: 'description b',
      },
    ];
    expect(sortOperations(operations)).toStrictEqual([
      operations[1],
      operations[0],
    ]);
  });

  test('Big', () => {
    const SECS_IN_DAY = 1000 * 60 * 60 * 24;
    const dates: string[] = [];
    for (let i = 0; i < 1000; i++)
      dates.push(isoDateToDate.encode(new Date(i * SECS_IN_DAY)));
    dates.reverse();
    const expected = dates.map((date, i) => ({
      id: 'id ' + date,
      date: date,
      amount: i,
      description: 'description ' + date,
    }));
    const operations = [...expected];
    expected.reverse();
    expect(sortOperations(operations)).toStrictEqual(expected);
  });
});
