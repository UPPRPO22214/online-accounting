import { type HandlersCreateTransactionRequest } from '@/shared/api';
import type { NonUndefined } from 'react-hook-form';

export type Period = NonUndefined<HandlersCreateTransactionRequest['period']>;

export const periodsLabels: Record<Period, string> = {
  day: 'Ежедневно',
  week: 'Еженедельно',
  month: 'Ежемесячно',
  year: 'Ежегодно',
};

export const periods = Object.keys(periodsLabels) as Period[];

export type OperationStatData = {
  amount: number;
  date: string;
};
