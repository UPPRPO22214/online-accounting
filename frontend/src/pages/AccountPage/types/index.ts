import * as z from 'zod';
// import { periods } from '@/entities/Operation/types/index';
import { type Operation, periods } from '@/entities/Operation/types/index';
import { isoDatetimeToDate, type EqualsCheck } from '@/shared/types';

export const operationSchema = z.object({
  description: z.string('Описание обязательно'),
  amount: z.coerce.number('Сумма обязательна'),
  date: z.date('Некорректная дата').refine((value) => {
    if (value instanceof Date) return true;
    if (typeof value !== 'string') return false;
    try {
      isoDatetimeToDate.decode(value);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }),
  periodic: z
    .object({
      period: z.union(
        [
          z.literal('daily'),
          z.literal('weekly'),
          z.literal('monthly'),
          z.literal('yearly'),
        ],
        'Период обязателен для повторяющейся операции',
      ),
      started_at: z
        .date('Старотовая дата обязательна для повторяющейся операции')
        .refine((value) => {
          if (value instanceof Date) return true;
          if (typeof value !== 'string') return false;
          try {
            isoDatetimeToDate.decode(value);
            return true;
          } catch (err) {
            console.error(err);
            return false;
          }
        }),
      ended_at: z
        .date()
        .optional()
        .refine((value) => {
          if (value instanceof Date) return true;
          if (typeof value !== 'string') return false;
          try {
            isoDatetimeToDate.decode(value);
            return true;
          } catch (err) {
            console.error(err);
            return false;
          }
        }),
    })
    .optional(),
});

export type OperationFormType = z.infer<typeof operationSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _check: EqualsCheck<OperationFormType, Omit<Operation, 'id'>> = 'equals';
