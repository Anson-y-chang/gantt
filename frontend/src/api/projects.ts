import { request } from './request';
import type { ProjectSubmitData } from '@/types/project';

export function fetchEmployee() {
  return request('/members', {
    method: 'GET',
  });
}

export function createProject(data: ProjectSubmitData) {
  return request('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProject(data: ProjectSubmitData & { id?: string | number }) {
  // Check backend for this route since it hasn't been implemented yet.
  const projectId = data.id || (data as any).project_id;
  return request(`/projects/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function removeProject(id: string | number) {
  return request(`/projects/${id}`, {
    method: 'DELETE',
  });
}
