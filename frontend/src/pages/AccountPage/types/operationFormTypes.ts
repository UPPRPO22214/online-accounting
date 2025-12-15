import * as z from 'zod';

export const operationCreateSchema = z.object({
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

export type OperationCreateFormType = z.infer<typeof operationCreateSchema>;

export const operationEditSchema = z.object({
  title: z.string('Название обязательно'),
  amount: z.coerce.number<number>('Сумма обязательна'),
  occurred_at: z.iso.date('Некорректная дата'),
});

export type OperationEditFormType = z.infer<typeof operationEditSchema>;
