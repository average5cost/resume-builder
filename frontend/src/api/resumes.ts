import client from './client';
import type { Resume, Module } from '../types/resume';

export async function listResumes(): Promise<Resume[]> {
  const { data } = await client.get('/resumes');
  return data;
}

export async function getResume(id: number): Promise<Resume> {
  const { data } = await client.get(`/resumes/${id}`);
  return data;
}

export async function createResume(title: string): Promise<Resume> {
  const { data } = await client.post('/resumes', { title });
  return data;
}

export async function updateResume(id: number, body: { title?: string; template_id?: string; font_scale?: number; primary_color?: string; accent_color?: string }): Promise<Resume> {
  const { data } = await client.put(`/resumes/${id}`, body);
  return data;
}

export async function deleteResume(id: number): Promise<void> {
  await client.delete(`/resumes/${id}`);
}

export async function createModule(resumeId: number, type: string): Promise<Module> {
  const { data } = await client.post(`/resumes/${resumeId}/modules`, { type });
  return data;
}

export async function updateModule(id: number, body: { visible?: boolean; data?: string }): Promise<Module> {
  const { data } = await client.put(`/modules/${id}`, body);
  return data;
}

export async function deleteModule(id: number): Promise<void> {
  await client.delete(`/modules/${id}`);
}

export async function reorderModules(resumeId: number, order: number[]): Promise<Module[]> {
  const { data } = await client.put(`/resumes/${resumeId}/modules/reorder`, { order });
  return data;
}
