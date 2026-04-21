import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { PublicUser } from '../models/user.model';
import { JwtPayload } from '../types';

const SALT_ROUNDS = 12;

export class AuthService {
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<{ user: PublicUser; token: string }> {
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) throw new Error('Email already in use');

    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) throw new Error('Username already taken');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create(username, email, passwordHash);
    const token = this.signToken(user);

    return { user, token };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: PublicUser; token: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) throw new Error('Invalid credentials');

    const { password_hash: _, ...publicUser } = user;
    const token = this.signToken(publicUser);

    return { user: publicUser, token };
  }

  private signToken(user: PublicUser): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    return jwt.sign(payload, secret, {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'],
    });
  }
}

export const authService = new AuthService();
