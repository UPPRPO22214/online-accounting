type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

const periodsRecord: Record<PeriodData['period'], unknown> = {
  daily: undefined,
  weekly: undefined,
  monthly: undefined,
  yearly: undefined
};

export const periods = Object.keys(periodsRecord) as PeriodData['period'][];

export type PeriodData = {
  period: Period;
  started_at: Date;
  ended_at?: Date;
}

export type Operation = {
  id: string;
  date: Date;
  amount: number;
  description: string;
  periodic?: PeriodData;
};
