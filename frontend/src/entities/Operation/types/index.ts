type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const periodsLabels: Record<PeriodData['period'], string> = {
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
  yearly: 'Ежегодно',
};

export const periods = Object.keys(periodsLabels) as PeriodData['period'][];

export type PeriodData = {
  period: Period;
  started_at: string;
  ended_at?: string;
};

export type Operation = {
  id: string;
  date: string;
  amount: number;
  description: string;
  periodic?: PeriodData;
};
