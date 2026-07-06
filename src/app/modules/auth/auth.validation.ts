import { z } from 'zod';

const loginValidationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const forgotPasswordValidationSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordValidationSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const authValidation = {
  loginValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
};
