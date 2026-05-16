import client from './client';
import type { Template } from '../types/resume';

export async function listTemplates(): Promise<Template[]> {
  const { data } = await client.get('/templates');
  return data;
}
