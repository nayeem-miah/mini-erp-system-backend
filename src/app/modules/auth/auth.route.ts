import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { authValidation } from './auth.validation';

const router = express.Router();

router.post(
  '/login',
  validateRequest(authValidation.loginValidationSchema),
  AuthController.login,
);

router.post('/logout', AuthController.logout);

router.post(
  '/forgot-password',
  validateRequest(authValidation.forgotPasswordValidationSchema),
  AuthController.forgotPassword,
);

router.post(
  '/forget-password',
  validateRequest(authValidation.forgotPasswordValidationSchema),
  AuthController.forgotPassword,
);

router.post(
  '/reset-password',
  validateRequest(authValidation.resetPasswordValidationSchema),
  AuthController.resetPassword,
);

export const AuthRoutes = router;