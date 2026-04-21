import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtPayload } from '../types';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ success: false, message: 'Server misconfiguration' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      avatar_url: null,
      created_at: new Date(0),
      updated_at: new Date(0),
    };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
