import * as z from 'zod';

export const operationSchema = z.object({
  title: z.string('Название обязательно'),
  category: z.string().optional(),
  amount: z.coerce.number<number>('Сумма обязательна'),
  occured_at: z.iso.date('Некорректная дата'),
  is_periodic: z.boolean(),
  // period: z
  //   .union([
  //     z.literal('daily'),
  //     z.literal('weekly'),
  //     z.literal('monthly'),
  //     z.literal('yearly'),
  //   ])
  //   .optional(),
});

export type OperationFormType = z.infer<typeof operationSchema>;
