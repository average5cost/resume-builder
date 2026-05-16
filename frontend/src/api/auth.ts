import client from './client';
import type { AuthResponse } from '../types/auth';

export async function login(username: string, password: string): Promise<AuthResponse> {
  const { data } = await client.post('/auth/login', { username, password });
  return data;
}

export async function register(username: string, password: string): Promise<AuthResponse> {
  const { data } = await client.post('/auth/register', { username, password });
  return data;
}

export async function me() {
  const { data } = await client.get('/auth/me');
  return data;
}
