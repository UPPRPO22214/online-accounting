import * as z from 'zod';

export const operationSchema = z.object({
  description: z.string('Описание обязательно'),
  amount: z.coerce.number<number>('Сумма обязательна'),
  date: z.iso.date('Некорректная дата'),
  period: z
    .union([
      z.literal('daily'),
      z.literal('weekly'),
      z.literal('monthly'),
      z.literal('yearly'),
    ])
    .optional(),
  ended_at: z.iso.date('Некорректная дата').optional(),
});

export type OperationFormType = z.infer<typeof operationSchema>;
