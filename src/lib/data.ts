
import type { StoreProject, Task, DocumentFile, Milestone, MarketingCampaign, Comment, ApprovalRequest, ApprovalStatus, StoreItem, ImprovementPoint, Blocker, Department, StoreTask, TaskPriority, User, ProjectMember } from '@/types';
import { format, addDays as dateFnsAddDays } from 'date-fns';

// Base URL for your API - replace with your actual API URL
const API_BASE_URL = '/api'; // Assuming API routes are in the same Next.js app

const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Helper function for API requests
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        // Include Authorization header if you have auth tokens
        // 'Authorization': `Bearer ${your_auth_token}`,
        ...options.headers,
      },
      ...options,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API request failed: ${response.status}`);
    }
    if (response.status === 204) { // No Content
        return undefined as T; // Or handle as appropriate
    }
    return response.json() as T;
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

// --- Project Functions ---
export async function getAllProjects(): Promise<StoreProject[]> {
  return fetchAPI<StoreProject[]>('/projects');
}

export async function getProjectById(id: string): Promise<StoreProject | undefined> {
  try {
    return await fetchAPI<StoreProject>(`/projects/${id}`);
  } catch (error) {
    // Handle 404 or other errors appropriately, e.g., return undefined or throw specific error
    if ((error as Error).message.includes('404') || (error as Error).message.toLowerCase().includes('not found')) {
        return undefined;
    }
    throw error;
  }
}

export async function createProject(projectData: Partial<StoreProject>): Promise<StoreProject> {
  return fetchAPI<StoreProject>('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
}

export async function updateProject(id: string, projectData: Partial<StoreProject>): Promise<StoreProject> {
  return fetchAPI<StoreProject>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  });
}

export async function addTaskToProject(projectId: string, taskData: Partial<Task>): Promise<Task> {
  return fetchAPI<Task>(`/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
}

export async function updateTaskInProject(projectId: string, taskId: string, taskData: Partial<Task>): Promise<Task> {
    return fetchAPI<Task>(`/projects/${projectId}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
    });
}

export async function addDocumentToProject(projectId: string, documentData: FormData): Promise<DocumentFile> {
  // For file uploads, use FormData and don't set Content-Type header (browser will set it with boundary)
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/documents`, {
      method: 'POST',
      body: documentData,
      // headers: { 'Authorization': `Bearer ${your_auth_token}` } // If needed
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API request failed: ${response.status}`);
    }
    return response.json() as DocumentFile;
  } catch (error) {
    console.error(`API call to /projects/${projectId}/documents failed:`, error);
    throw error;
  }
}

export async function addCommentToProject(projectId: string, commentData: Partial<Comment>): Promise<Comment> {
  return fetchAPI<Comment>(`/projects/${projectId}/comments`, {
    method: 'POST',
    body: JSON.stringify(commentData),
  });
}

export async function addReplyToProjectComment(projectId: string, commentId: string, replyData: Partial<Comment>): Promise<Comment> {
    return fetchAPI<Comment>(`/projects/${projectId}/comments/${commentId}/replies`, {
        method: 'POST',
        body: JSON.stringify(replyData),
    });
}

export async function addMemberToProject(projectId: string, memberData: { email: string; roleInProject: string; isProjectHod: boolean }): Promise<ProjectMember> {
    return fetchAPI<ProjectMember>(`/projects/${projectId}/members`, {
        method: 'POST',
        body: JSON.stringify(memberData),
    });
}

export async function removeMemberFromProject(projectId: string, memberEmail: string): Promise<void> {
    return fetchAPI<void>(`/projects/${projectId}/members/${encodeURIComponent(memberEmail)}`, {
        method: 'DELETE',
    });
}


// --- Store Functions ---
export async function getAllStores(): Promise<StoreItem[]> {
  return fetchAPI<StoreItem[]>('/stores');
}

export async function getStoreById(id: string): Promise<StoreItem | undefined> {
  try {
    return await fetchAPI<StoreItem>(`/stores/${id}`);
  } catch (error) {
     if ((error as Error).message.includes('404') || (error as Error).message.toLowerCase().includes('not found')) {
        return undefined;
    }
    throw error;
  }
}

export async function updateStore(id: string, storeData: Partial<StoreItem>): Promise<StoreItem> {
  return fetchAPI<StoreItem>(`/stores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(storeData),
  });
}

export async function addImprovementPointToStore(storeId: string, pointData: Partial<ImprovementPoint>): Promise<ImprovementPoint> {
  return fetchAPI<ImprovementPoint>(`/stores/${storeId}/improvement-points`, {
    method: 'POST',
    body: JSON.stringify(pointData),
  });
}

export async function updateImprovementPointInStore(storeId: string, pointId: string, pointData: Partial<ImprovementPoint>): Promise<ImprovementPoint> {
  return fetchAPI<ImprovementPoint>(`/stores/${storeId}/improvement-points/${pointId}`, {
    method: 'PUT',
    body: JSON.stringify(pointData),
  });
}

export async function addCommentToImprovementPoint(storeId: string, pointId: string, commentData: Partial<Comment>): Promise<Comment> {
    return fetchAPI<Comment>(`/stores/${storeId}/improvement-points/${pointId}/comments`, {
        method: 'POST',
        body: JSON.stringify(commentData),
    });
}

export async function addStoreTask(storeId: string, taskData: Partial<StoreTask>): Promise<StoreTask> {
  return fetchAPI<StoreTask>(`/stores/${storeId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
}

export async function updateStoreTask(storeId: string, taskId: string, taskData: Partial<StoreTask>): Promise<StoreTask> {
  return fetchAPI<StoreTask>(`/stores/${storeId}/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  });
}

export async function deleteStoreTask(storeId: string, taskId: string): Promise<void> {
  return fetchAPI<void>(`/stores/${storeId}/tasks/${taskId}`, {
    method: 'DELETE',
  });
}


// --- Head Office Contacts ---
export async function getHeadOfficeContacts(): Promise<ProjectMember[]> { // Assuming ProjectMember type can represent HO contacts
  return fetchAPI<ProjectMember[]>('/users/contacts'); // Example endpoint
}

// --- Approval Requests ---
export async function getApprovalRequestsForUser(userEmail: string): Promise<{ awaiting: ApprovalRequest[], submitted: ApprovalRequest[] }> {
  // This might be two separate API calls or one that returns structured data
  const requests = await fetchAPI<ApprovalRequest[]>(`/approval-requests?userEmail=${encodeURIComponent(userEmail)}`);
  return {
    awaiting: requests.filter(req => req.approverEmail === userEmail && req.status === "Pending"),
    submitted: requests.filter(req => req.requestorEmail === userEmail),
  };
}

export async function submitApprovalRequest(requestData: Omit<ApprovalRequest, 'id' | 'submissionDate' | 'status' | 'lastUpdateDate' | 'approvalComments'>): Promise<ApprovalRequest> {
  return fetchAPI<ApprovalRequest>('/approval-requests', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
}

export async function updateApprovalRequestStatus(
  requestId: string,
  statusUpdate: { newStatus: ApprovalStatus; actorName: string; commentText?: string }
): Promise<ApprovalRequest> {
  return fetchAPI<ApprovalRequest>(`/approval-requests/${requestId}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusUpdate),
  });
}

// --- User Tasks (Aggregated from Projects) ---
export async function getTasksForUser(userEmailOrName: string): Promise<Task[]> {
    // This would likely query project tasks assigned to the user
    return fetchAPI<Task[]>(`/tasks?assignedTo=${encodeURIComponent(userEmailOrName)}`);
}

export async function assignTaskToUser(taskData: Partial<Task>): Promise<Task> {
    // This endpoint would likely create a task within a specific project
    // It might need projectId in taskData or a different endpoint structure
    if (!taskData.id) { // Assuming new tasks won't have an ID from client
        return fetchAPI<Task>(`/tasks`, { // General endpoint for assigning new task
            method: 'POST',
            body: JSON.stringify(taskData),
        });
    }
    // If updating an existing task's assignment, it might be different
    throw new Error("Updating existing task assignment not directly supported by this generic function yet.");
}


// --- Mock Data (to be removed or used as fallback if API fails during dev) ---
// It's generally better to remove mock data entirely when switching to an API.
// For brevity, I will comment it out. If you need it for local fallback, uncomment and adjust.

/*
export let mockProjects: StoreProject[] = [ ... ];
export let tasks: Task[] = [ ... ];
export let mockHeadOfficeContacts: ProjectMember[] = [ ... ];
export let mockApprovalRequests: ApprovalRequest[] = [ ... ];
export let mockStores: StoreItem[] = [ ... ];
*/

// Note: Functions that were previously synchronous and manipulated mock arrays (like mockProjects.push)
// are now asynchronous and expect your backend API to handle data persistence.
// The UI components will need to be updated to handle these asynchronous operations (e.g., with useEffect, useState for loading/error states, or a data fetching library like TanStack Query).
    