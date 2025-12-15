import * as z from 'zod';

export const operationSchema = z.object({
  title: z.string('Название обязательно'),
  amount: z.coerce.number<number>('Сумма обязательна'),
  occurred_at: z.iso.date('Некорректная дата'),
  period: z
    .union([
      z.literal('day'),
      z.literal('week'),
      z.literal('month'),
      z.literal('year'),
    ])
    .optional(),
});

export type OperationFormType = z.infer<typeof operationSchema>;
