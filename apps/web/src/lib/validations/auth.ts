import { z } from 'zod';

export const loginSchema = z.object({
  login: z
    .string()
    .min(3, 'validation.min_length_3')
    .max(100, 'validation.max_length_100'),
  password: z
    .string()
    .min(8, 'validation.password_min')
    .max(128, 'validation.max_length_128'),
  remember: z.boolean().optional(),
});

export const studentRegisterSchema = z
  .object({
    first_name: z.string().min(2, 'validation.min_length_2').max(50, 'validation.max_length_50'),
    last_name: z.string().min(2, 'validation.min_length_2').max(50, 'validation.max_length_50'),
    username: z
      .string()
      .min(3, 'validation.min_length_3')
      .max(30, 'validation.max_length_30')
      .regex(/^[a-z0-9_]+$/, 'validation.username_format'),
    password: z.string().min(8, 'validation.password_min').max(128, 'validation.max_length_128'),
    password_confirmation: z.string(),
    school_id: z.number({ required_error: 'validation.required' }).positive(),
    class_id: z.number({ required_error: 'validation.required' }).positive(),
    teacher_id: z.number().positive().optional(),
    parent_username: z.string().optional(),
    locale: z.enum(['az', 'ru', 'en']),
    role: z.literal('student'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'validation.password_mismatch',
    path: ['password_confirmation'],
  });

export const teacherRegisterSchema = z
  .object({
    first_name: z.string().min(2).max(50),
    last_name: z.string().min(2).max(50),
    username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/),
    email: z.string().email('validation.email_invalid'),
    phone: z.string().min(7).max(20).optional(),
    password: z.string().min(8).max(128),
    password_confirmation: z.string(),
    school_id: z.number().positive(),
    subject: z.string().min(2).max(100).optional(),
    experience: z.number().min(0).max(50).optional(),
    locale: z.enum(['az', 'ru', 'en']),
    role: z.literal('teacher'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'validation.password_mismatch',
    path: ['password_confirmation'],
  });

export const parentRegisterSchema = z
  .object({
    first_name: z.string().min(2).max(50),
    last_name: z.string().min(2).max(50),
    username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/),
    phone: z.string().min(7).max(20).optional(),
    password: z.string().min(8).max(128),
    password_confirmation: z.string(),
    locale: z.enum(['az', 'ru', 'en']),
    role: z.literal('parent'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'validation.password_mismatch',
    path: ['password_confirmation'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('validation.email_invalid'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'validation.password_mismatch',
    path: ['password_confirmation'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
export type TeacherRegisterInput = z.infer<typeof teacherRegisterSchema>;
export type ParentRegisterInput = z.infer<typeof parentRegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
