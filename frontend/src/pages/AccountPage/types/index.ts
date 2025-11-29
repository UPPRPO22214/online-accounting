import * as z from 'zod';
import { isoDateToDate } from '@/shared/types';

export const operationSchema = z.object({
  description: z.string('Описание обязательно'),
  amount: z.coerce.number<number>('Сумма обязательна'),
  date: z.iso.date('Некорректная дата').refine((value) => {
    console.log(value);
    if (typeof value !== 'string') return false;
    try {
      isoDateToDate.decode(value);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }),
  period: z
    .union([
      z.literal('daily'),
      z.literal('weekly'),
      z.literal('monthly'),
      z.literal('yearly'),
    ])
    .optional(),
  ended_at: z.iso
    .date()
    .optional()
    .refine((value) => {
      if (typeof value !== 'string') return false;
      try {
        isoDateToDate.decode(value);
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    })
    .optional(),
});

export type OperationFormType = z.infer<typeof operationSchema>;
