import api from './api';
import { ApiResponse, AuthData } from '../types';

export const authService = {
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<AuthData> {
    const { data } = await api.post<ApiResponse<AuthData>>('/auth/register', {
      username,
      email,
      password,
    });
    if (!data.success || !data.data) throw new Error(data.message ?? 'Registration failed');
    return data.data;
  },

  async login(email: string, password: string): Promise<AuthData> {
    const { data } = await api.post<ApiResponse<AuthData>>('/auth/login', {
      email,
      password,
    });
    if (!data.success || !data.data) throw new Error(data.message ?? 'Login failed');
    return data.data;
  },
};
