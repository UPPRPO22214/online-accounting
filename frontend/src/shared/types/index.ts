import * as z from 'zod';

export type EqualsCheck<T, U> = T extends U ? U extends T ? 'equals' : 'differs' : 'differs';

export const isoDateToDate = z.codec(z.iso.date(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (date) => date.toISOString(),
});