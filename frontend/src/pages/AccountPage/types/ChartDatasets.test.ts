import type { Operation } from '@/entities/Operation';
import { getChartDataset } from './chartDatasetsTypes';
import { describe, expect, test } from 'vitest';

describe('Chart datasets accumulated tests', () => {
  test('Empty accumulated', () => {
    expect(getChartDataset([], 'accumulate')).toBeUndefined();
  });

  test('One income accumulated', () => {
    const operations: Operation[] = [
      {
        id: '',
        date: '2025-11-11',
        amount: 100,
        description: '',
      },
    ];
    expect(getChartDataset(operations, 'accumulate')).toStrictEqual({
      date: ['11.11.2025'],
      income: [100],
      outcome: [0],
    });
  });

  test('One outcome accumulated', () => {
    const operations: Operation[] = [
      {
        id: '',
        date: '2025-11-11',
        amount: -100,
        description: '',
      },
    ];
    expect(getChartDataset(operations, 'accumulate')).toStrictEqual({
      date: ['11.11.2025'],
      income: [0],
      outcome: [100],
    });
  });

  test('Two accumulated', () => {
    const operations: Operation[] = [
      {
        id: '',
        date: '2025-11-11',
        amount: -100,
        description: '',
      },
      {
        id: '',
        date: '2025-11-11',
        amount: 100,
        description: '',
      },
    ];
    expect(getChartDataset(operations, 'accumulate')).toStrictEqual({
      date: ['11.11.2025'],
      income: [100],
      outcome: [100],
    });
  });

  test('Normal', () => {
    const operations: Operation[] = [
      {
        id: '',
        date: '2025-11-11',
        amount: -100,
        description: '',
      },
      {
        id: '',
        date: '2025-11-12',
        amount: 100,
        description: '',
      },
      {
        id: '',
        date: '2025-11-13',
        amount: -1000,
        description: '',
      },
      {
        id: '',
        date: '2025-11-14',
        amount: 2000,
        description: '',
      },
      {
        id: '',
        date: '2025-11-15',
        amount: 100,
        description: '',
      },
      {
        id: '',
        date: '2025-11-19',
        amount: -1,
        description: '',
      },
    ];
    expect(getChartDataset(operations, 'accumulate')).toStrictEqual({
      date: [
        '11.11.2025',
        '12.11.2025',
        '13.11.2025',
        '14.11.2025',
        '15.11.2025',
        '19.11.2025',
      ],
      income: [0, 100, 100, 2100, 2200, 2200],
      outcome: [100, 100, 1100, 1100, 1100, 1101],
    });
  });
});

describe('Chart datasets separated tests', () => {
  test('Empty separated', () => {
    expect(getChartDataset([], 'separate')).toBeUndefined();
  });

  test('One income separated', () => {
    const operations: Operation[] = [
      {
        id: '',
        date: '2025-11-11',
        amount: 100,
        description: '',
      },
    ];
    expect(getChartDataset(operations, 'separate')).toStrictEqual({
      date: ['11.11.2025'],
      income: [100],
      outcome: [0],
    });
  });

  test('One outcome separated', () => {
    const operations: Operation[] = [
      {
        id: '',
        date: '2025-11-11',
        amount: -100,
        description: '',
      },
    ];
    expect(getChartDataset(operations, 'separate')).toStrictEqual({
      date: ['11.11.2025'],
      income: [0],
      outcome: [100],
    });
  });

  test('Two separated', () => {
    const operations: Operation[] = [
      {
        id: '',
        date: '2025-11-11',
        amount: -100,
        description: '',
      },
      {
        id: '',
        date: '2025-11-11',
        amount: 100,
        description: '',
      },
    ];
    expect(getChartDataset(operations, 'separate')).toStrictEqual({
      date: ['11.11.2025'],
      income: [100],
      outcome: [100],
    });
  });

  test('Normal', () => {
    const operations: Operation[] = [
      {
        id: '',
        date: '2025-11-11',
        amount: -100,
        description: '',
      },
      {
        id: '',
        date: '2025-11-12',
        amount: 100,
        description: '',
      },
      {
        id: '',
        date: '2025-11-13',
        amount: -1000,
        description: '',
      },
      {
        id: '',
        date: '2025-11-14',
        amount: 2000,
        description: '',
      },
      {
        id: '',
        date: '2025-11-15',
        amount: 100,
        description: '',
      },
      {
        id: '',
        date: '2025-11-19',
        amount: -1,
        description: '',
      },
    ];
    expect(getChartDataset(operations, 'separate')).toStrictEqual({
      date: [
        '11.11.2025',
        '12.11.2025',
        '13.11.2025',
        '14.11.2025',
        '15.11.2025',
        '19.11.2025',
      ],
      income: [0, 100, 0, 2000, 100, 0],
      outcome: [100, 0, 1000, 0, 0, 1],
    });
  });
});
