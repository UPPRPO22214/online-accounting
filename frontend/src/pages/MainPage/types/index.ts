import * as z from 'zod';

export const loginZodSchema = z.object({
  email: z.email('Некорректная электронная почта'),
  password: z.string().min(8, 'Минимальная длина пароля - 8 символов'),
});

export type LoginType = z.infer<typeof loginZodSchema>;

export const registerZodSchema = loginZodSchema
  .and(
    z.object({
      nickname: z.string().min(1, 'Никнейм - обязательное поле'),
      passwordTwice: z.string(),
    }),
  )
  .refine((state) => state.password === state.passwordTwice, {
    error: 'Пароль введён повторно неверно',
    path: ['passwordTwice'],
  });

export type RegisterType = z.infer<typeof registerZodSchema>;
