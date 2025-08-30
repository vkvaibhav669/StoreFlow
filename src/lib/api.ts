

import type { StoreProject, StoreItem, Task, User, DocumentFile, Note, Comment, ApprovalRequest } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

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
    const url = `${BASE_URL}/api${endpoint}`;
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

// Documents API
export async function getAllDocuments(): Promise<(DocumentFile & { projectId: string, projectName: string })[]> {
  return apiFetch<(DocumentFile & { projectId: string, projectName: string })[]>('/documents');
}

export async function uploadDocument(formData: FormData): Promise<DocumentFile> {
  const url = `${BASE_URL}/documents`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    // Do not set Content-Type header, browser will set it with boundary
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to upload document' }));
    throw new ApiError(errorData.message, response.status);
  }
  return response.json();
}

// Stores API
export async function getAllStores(): Promise<StoreItem[]> {
  return apiFetch<StoreItem[]>('/store');
}

export async function getStoreById(id: string): Promise<StoreItem> {
  return apiFetch<StoreItem>(`/store/${id}`);
}

export async function createStore(storeData: Partial<StoreItem>): Promise<StoreItem> {
  return apiFetch<StoreItem>('/store', {
    method: 'POST',
    body: JSON.stringify(storeData),
  });
}

export async function updateStore(id: string, storeData: Partial<StoreItem>): Promise<StoreItem> {
  return apiFetch<StoreItem>(`/store/${id}`, {
    method: 'PUT',
    body: JSON.stringify(storeData),
  });
}

// Tasks API
export async function getTasksForUser(userId: string): Promise<Task[]> {
  // Use URL encoding for the userId to handle special characters in emails
  return apiFetch<Task[]>(`/users/${encodeURIComponent(userId)}/tasks-assigned`);
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
export async function addProjectComment(projectId: string, commentData: { author: string; text: string; authorId?: string }) {
  return apiFetch(`/projects/${projectId}/comments`, {
    method: 'POST',
    body: JSON.stringify(commentData),
  });
}

// DEPRECATED - Use getCommentsForTaskInProject
export async function getTaskComments(taskId: string) {
  return apiFetch(`/task-comments/${taskId}`);
}

// DEPRECATED - Use addCommentToTaskInProject
export async function addTaskComment(taskId: string, commentData: { author: string; text: string; authorId?: string }) {
  return apiFetch(`/task-comments/${taskId}`, {
    method: 'POST',
    body: JSON.stringify(commentData),
  });
}


// New Task Comment Functions
export async function getCommentsForTaskInProject(projectId: string, taskId: string): Promise<Comment[]> {
  return apiFetch<Comment[]>(`/projects/${projectId}/tasks/${taskId}/comments`);
}

export async function addCommentToTaskInProject(projectId: string, taskId: string, commentData: { author: string; text: string; authorId?: string }): Promise<Comment> {
  return apiFetch<Comment>(`/projects/${projectId}/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify(commentData),
  });
}


// Notes API
export async function getVisibleNotes(userEmail: string): Promise<Note[]> {
    // We pass the user's email in a header for mock authentication
    return apiFetch<Note[]>('/notes', { headers: { 'x-user-email': userEmail } });
}

export async function createNote(noteData: Partial<Note>, userEmail: string): Promise<Note> {
    return apiFetch<Note>('/notes', {
        method: 'POST',
        body: JSON.stringify(noteData),
        headers: { 'x-user-email': userEmail },
    });
}

export async function deleteNote(noteId: string, userEmail: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/notes?id=${noteId}`, {
        method: 'DELETE',
        headers: { 'x-user-email': userEmail },
    });
}

// Improvement Points & Store Tasks
export async function addImprovementPointToStore(storeId: string, pointData: Partial<ImprovementPoint>): Promise<ImprovementPoint> {
  return apiFetch<ImprovementPoint>(`/stores/${storeId}/improvementPoints`, {
    method: 'POST',
    body: JSON.stringify(pointData),
  });
}

export async function updateImprovementPointInStore(storeId: string, pointId: string, pointData: Partial<ImprovementPoint>): Promise<ImprovementPoint> {
    return apiFetch<ImprovementPoint>(`/stores/${storeId}/improvementPoints/${pointId}`, {
        method: 'PUT',
        body: JSON.stringify(pointData),
    });
}

export async function addCommentToImprovementPoint(storeId: string, pointId: string, commentData: Partial<Comment>): Promise<Comment> {
    return apiFetch<Comment>(`/stores/${storeId}/improvementPoints/${pointId}/comments`, {
        method: 'POST',
        body: JSON.stringify(commentData),
    });
}

export async function addStoreTask(storeId: string, taskData: Partial<StoreTask>): Promise<StoreTask> {
    return apiFetch<StoreTask>(`/stores/${storeId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(taskData),
    });
}

export async function updateStoreTask(storeId: string, taskId: string, taskData: Partial<StoreTask>): Promise<StoreTask> {
    return apiFetch<StoreTask>(`/stores/${storeId}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
    });
}

export async function deleteStoreTask(storeId: string, taskId: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/stores/${storeId}/tasks/${taskId}`, {
        method: 'DELETE',
    });
}

// Approval Requests API
export async function getApprovalRequestsForUser(userEmail: string): Promise<{ awaiting: ApprovalRequest[], submitted: ApprovalRequest[] }> {
    return apiFetch<{ awaiting: ApprovalRequest[], submitted: ApprovalRequest[] }>(`/approval-requests`, {
        headers: { 'x-user-email': userEmail },
    });
}

export async function submitApprovalRequest(requestData: Partial<ApprovalRequest>, userEmail: string): Promise<ApprovalRequest> {
    return apiFetch<ApprovalRequest>('/approval-requests', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: { 'x-user-email': userEmail },
    });
}

export async function updateApprovalRequest(requestId: string, updateData: { status: 'Approved' | 'Rejected'; actorEmail: string; comment?: string }): Promise<ApprovalRequest> {
    return apiFetch<ApprovalRequest>(`/approval-requests/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'x-user-email': updateData.actorEmail },
    });
}
