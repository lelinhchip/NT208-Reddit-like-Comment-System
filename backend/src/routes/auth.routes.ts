import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, (req, res) =>
  authController.register(req, res)
);
authRouter.post('/login', authRateLimiter, (req, res) =>
  authController.login(req, res)
);
