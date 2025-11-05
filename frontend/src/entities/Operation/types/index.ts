type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

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
