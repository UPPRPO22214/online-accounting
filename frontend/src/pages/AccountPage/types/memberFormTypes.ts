import * as z from 'zod';

export const memberSchema = z.object({
  email: z.email('Некорректная электронная почта'),
  role: z.union(
    [z.literal('admin'), z.literal('contributor'), z.literal('viewer')],
    'Некорректная роль',
  ),
});

export type MemberFormType = z.infer<typeof memberSchema>;
