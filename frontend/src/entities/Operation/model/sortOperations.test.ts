import { isoDateToDate } from '@/shared/types';
import type { OperationStatData } from '../types';
import { sortOperations } from './sortOperations';
import { describe, expect, test } from 'vitest';

describe('Sort OpeationStatDatas tests', () => {
  test('Empty', () => {
    expect(sortOperations([])).length(0);
  });

  test('One', () => {
    const OpeationStatDatas: OperationStatData[] = [
      {
        date: isoDateToDate.encode(new Date()),
        amount: 0,
      },
    ];
    expect(sortOperations(OpeationStatDatas)).toStrictEqual(OpeationStatDatas);
  });

  test('Two same', () => {
    const date = isoDateToDate.encode(new Date());
    const OpeationStatDatas: OperationStatData[] = [
      {
        date: date,
        amount: 1,
      },
      {
        date: date,
        amount: 2,
      },
    ];
    expect(sortOperations(OpeationStatDatas)).toStrictEqual(OpeationStatDatas);
  });

  test('Unchanged', () => {
    const date1 = isoDateToDate.encode(new Date(2025, 11, 11));
    const date2 = isoDateToDate.encode(new Date(2025, 11, 12));
    const OpeationStatDatas: OperationStatData[] = [
      {
        date: date1,
        amount: 1,
      },
      {
        date: date2,
        amount: 2,
      },
    ];
    expect(sortOperations(OpeationStatDatas)).toStrictEqual(OpeationStatDatas);
  });

  test('Normal', () => {
    const date1 = isoDateToDate.encode(new Date(2025, 11, 11));
    const date2 = isoDateToDate.encode(new Date(2025, 11, 12));
    const OpeationStatDatas: OperationStatData[] = [
      {
        date: date2,
        amount: 1,
      },
      {
        date: date1,
        amount: 2,
      },
    ];
    expect(sortOperations(OpeationStatDatas)).toStrictEqual([
      OpeationStatDatas[1],
      OpeationStatDatas[0],
    ]);
  });

  test('Big', () => {
    const SECS_IN_DAY = 1000 * 60 * 60 * 24;
    const dates: string[] = [];
    for (let i = 0; i < 1000; i++)
      dates.push(isoDateToDate.encode(new Date(i * SECS_IN_DAY)));
    dates.reverse();
    const expected = dates.map((date, i) => ({
      date: date,
      amount: i,
    }));
    const OpeationStatDatas = [...expected];
    expected.reverse();
    expect(sortOperations(OpeationStatDatas)).toStrictEqual(expected);
  });
});
