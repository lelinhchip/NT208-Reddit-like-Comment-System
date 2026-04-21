import { pool } from '../config/database';
import { User, PublicUser } from '../models/user.model';

export class UserRepository {
  async findById(id: string): Promise<PublicUser | null> {
    const result = await pool.query<PublicUser>(
      `SELECT id, username, email, avatar_url, created_at, updated_at
         FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query<User>(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );
    return result.rows[0] ?? null;
  }

  async create(
    username: string,
    email: string,
    passwordHash: string
  ): Promise<PublicUser> {
    const result = await pool.query<PublicUser>(
      `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, username, email, avatar_url, created_at, updated_at`,
      [username, email, passwordHash]
    );
    return result.rows[0];
  }
}

export const userRepository = new UserRepository();
