import type { StoreProject, StoreItem, Task } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Error handling utility
class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper with error handling
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or other errors
    throw new ApiError(`Network error: ${(error as Error).message}`);
  }
}

// Projects API
export async function getAllProjects(): Promise<StoreProject[]> {
  return apiFetch<StoreProject[]>('/projects');
}

export async function getProjectById(id: string): Promise<StoreProject> {
  return apiFetch<StoreProject>(`/projects/${id}`);
}

export async function createProject(projectData: Partial<StoreProject>): Promise<StoreProject> {
  return apiFetch<StoreProject>('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
}

export async function updateProject(id: string, projectData: Partial<StoreProject>): Promise<StoreProject> {
  return apiFetch<StoreProject>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  });
}

// Stores API
export async function getAllStores(): Promise<StoreItem[]> {
  return apiFetch<StoreItem[]>('/stores');
}

export async function getStoreById(id: string): Promise<StoreItem> {
  return apiFetch<StoreItem>(`/stores/${id}`);
}

export async function createStore(storeData: Partial<StoreItem>): Promise<StoreItem> {
  return apiFetch<StoreItem>('/stores', {
    method: 'POST',
    body: JSON.stringify(storeData),
  });
}

export async function updateStore(id: string, storeData: Partial<StoreItem>): Promise<StoreItem> {
  return apiFetch<StoreItem>(`/stores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(storeData),
  });
}

// Tasks API
export async function getTasksForUser(userId: string): Promise<Task[]> {
  return apiFetch<Task[]>(`/tasks/${userId}`);
}

export async function getAllTasks(): Promise<Task[]> {
  return apiFetch<Task[]>('/tasks');
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  return apiFetch<Task[]>(`/tasks/${projectId}`);
}

export async function createTask(taskData: Partial<Task>): Promise<Task> {
  return apiFetch<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
}

export async function updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
  return apiFetch<Task>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  });
}