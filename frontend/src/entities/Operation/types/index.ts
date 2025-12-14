export type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const periodsLabels: Record<Period, string> = {
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
  yearly: 'Ежегодно',
};

export const periods = Object.keys(periodsLabels) as Period[];

export type OperationStatData = {
  amount: number;
  date: string;
};
