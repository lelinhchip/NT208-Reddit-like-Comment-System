import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^\w+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        errors: parsed.error.errors.map((e) => e.message),
      });
      return;
    }

    try {
      const { user, token } = await authService.register(
        parsed.data.username,
        parsed.data.email,
        parsed.data.password
      );
      res.status(201).json({ success: true, data: { user, token } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      res.status(409).json({ success: false, message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        errors: parsed.error.errors.map((e) => e.message),
      });
      return;
    }

    try {
      const { user, token } = await authService.login(
        parsed.data.email,
        parsed.data.password
      );
      res.status(200).json({ success: true, data: { user, token } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      res.status(401).json({ success: false, message });
    }
  }
}

export const authController = new AuthController();
