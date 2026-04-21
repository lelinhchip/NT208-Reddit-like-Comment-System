import { Request } from 'express';
import { PublicUser } from '../models/user.model';

export interface AuthenticatedRequest extends Request {
  user?: PublicUser;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}
