
import type { StoreProject, StoreItem, Task, User } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Error handling utility
class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper with error handling and no-cache policy
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const url = BASE_URL ? `${BASE_URL}${endpoint}` : `${endpoint}`;
    console.log(`Fetching api endpoint: ${url}`);
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      cache: 'no-store', // Ensure fresh data is fetched on every request
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `API request failed: ${response.status} ${response.statusText}` }));
      throw new ApiError(
        errorData.message || `API request failed: ${response.status} ${response.statusText}`,
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

// User API
export async function getAllUsers(): Promise<User[]> {
  return apiFetch<User[]>('/users');
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
// Note: This endpoint is not yet defined in your API routes.
// You might need to create `/api/tasks/user/:userId/route.ts` for this to work.
export async function getTasksForUser(userId: string): Promise<Task[]> {
  // Assuming an API endpoint structure like /api/tasks/user/{userId}
  return apiFetch<Task[]>(`/tasks/user/${userId}`);
}


export async function getAllTasks(): Promise<Task[]> {
  return apiFetch<Task[]>('/tasks');
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  return apiFetch<Task[]>(`/tasks/${projectId}`);
}

export async function createTask(projectId: string, taskData: Partial<Task>): Promise<Task> {
  return apiFetch<Task>(`/tasks/${projectId}`, {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
}

export async function updateTask(projectId: string, taskId: string, taskData: Partial<Task>): Promise<Task> {
  console.log('Updating task of id  ', taskId, 'with data: ', taskData);
  // The API endpoint should ideally be something like `/api/projects/:projectId/tasks/:taskq
  return apiFetch<Task>(`/tasks/${projectId}/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  });
}

// Comments API
export async function getProjectComments(projectId: string) {
  return apiFetch(`/projects/${projectId}/comments`);
}

export async function addProjectComment(projectId: string, commentData: { author: string; text: string; authorId?: string }) {
  return apiFetch(`/projects/${projectId}/comments`, {
    method: 'POST',
    body: JSON.stringify(commentData),
  });
}

export async function getTaskComments(taskId: string) {
  return apiFetch(`/task-comments/${taskId}`);
}

export async function addTaskComment(taskId: string, commentData: { author: string; text: string; authorId?: string }) {
  return apiFetch(`/task-comments/${taskId}`, {
    method: 'POST',
    body: JSON.stringify(commentData),
  });
}
    
