import { request } from './request';

export function updateTask(id: string | number, data: any) {
    return request(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export function updateMultiTasks(tasks: any[]) {
    // Assuming there is a batch update endpoint, otherwise map multiple updateTask
    return request('/tasks/bulk', {
        method: 'PUT',
        body: JSON.stringify({ tasks }),
    });
}
