
import type { StoreProject, Task, DocumentFile, Milestone, MarketingCampaign, Comment, ApprovalRequest, ApprovalStatus, StoreItem, ImprovementPoint, Blocker, Department, DepartmentDetails, StoreTask, TaskPriority, User, ProjectMember } from '@/types';
import { format, addDays as dateFnsAddDays } from 'date-fns';

export const formatDate = (date: Date): string => date.toISOString().split('T')[0];
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// --- Mock Data with Indian Theme ---

export const mockHeadOfficeContacts: ProjectMember[] = [];

const commonProjectMembers: ProjectMember[] = [];


export let mockProjects: StoreProject[] = [
  {
    id: "685d0c075656e677824a318f",
    name: "New Flagship Store",
    location: "Mumbai, Maharashtra",
    status: "Planning",
    startDate: "2025-07-01T00:00:00.000Z",
    projectedLaunchDate: "2026-01-01T00:00:00.000Z",
    currentProgress: 0,
    isUpcoming: false,
    franchiseType: "COCO",
    propertyDetails: {
      address: "123 Main Street, Mumbai",
      sqft: 2500,
      status: "Identified",
      notes: "Prime location in commercial area"
    },
    projectTimeline: {
      totalDays: 150,
      currentDay: 30,
      kickoffDate: "2025-07-01T00:00:00.000Z"
    },
    tasks: [
      {
        id: "685e58c122b9d912d6223a3d",
        name: "Sample Task 17",
        department: "IT",
        status: "In Progress",
        priority: "High",
        dueDate: "2025-07-01T00:00:00.000Z",
        description: "This is a function feature test in progress",
        comments: [
          {
            text: "This is a comment",
            addedById: "685d0a785656e677824a3185",
            addedByName: "Admin",
            _id: "685e58d322b9d912d6223a43",
            addedAt: "2025-06-27T08:39:47.280Z",
            id: "685e58d322b9d912d6223a43",
            author: "Admin",
            timestamp: "2025-06-27T08:39:47.280Z",
            replies: []
          },
          {
            text: "This is a comment by user 2 ",
            addedById: "685d0a785656e677824a3185",
            addedByName: "Admin",
            _id: "685e58e322b9d912d6223a4a",
            addedAt: "2025-06-27T08:40:03.444Z",
            id: "685e58e322b9d912d6223a4a",
            author: "Admin",
            timestamp: "2025-06-27T08:40:03.444Z",
            replies: [
              {
                text: "This is a reply to comment ",
                addedById: "685d0a785656e677824a3185",
                addedByName: "Vaibhhav ",
                _id: "685e70de5f60d8170479bed0",
                addedAt: "2025-06-27T10:22:22.247Z",
                id: "685e70de5f60d8170479bed0",
                author: "Vaibhhav ",
                timestamp: "2025-06-27T10:22:22.247Z",
                replies: []
              }
            ]
          }
        ],
        createdAt: "2025-06-27T08:39:29.163Z"
      }
    ],
    members: [
      {
        userId: "685d0a785656e677824a3185",
        name: "Admin User",
        email: "admin@example.com",
        roleInProject: "HOD",
        department: "Project",
        isProjectHod: true
      }
    ],
    documents: [],
    comments: [],
    milestones: [],
    blockers: [],
    discussion: [],
    departments: {},
    createdAt: "2025-06-26T08:59:51.634Z",
    updatedAt: "2025-07-07T07:43:37.849Z"
  },
  {
    id: "project-2", 
    name: "Delhi Store Launch",
    location: "Delhi, India",
    status: "Execution",
    startDate: "2023-12-01",
    projectedLaunchDate: "2024-05-01",
    currentProgress: 60,
    isUpcoming: false,
    franchiseType: "FOFO",
    propertyDetails: {
      address: "456 Market Road, Delhi",
      sqft: 3000,
      status: "Finalized",
      notes: "High traffic area"
    },
    projectTimeline: {
      totalDays: 120,
      currentDay: 72,
      kickoffDate: "2023-12-01"
    },
    tasks: [
      {
        id: "task-2",
        name: "Interior Design",
        department: "Project",
        status: "Completed",
        priority: "Medium",
        assignedTo: "design.team@company.com",
        assignedToName: "Design Team",
        dueDate: "2024-03-01",
        description: "Complete interior design and fit-out"
      }
    ],
    members: [],
    documents: [],
    comments: [],
    milestones: [],
    blockers: [],
    discussion: [],
    departments: {}
  }
];

export let mockStores: StoreItem[] = [
  {
    id: "store-1",
    name: "Mumbai Central Store",
    location: "Mumbai, Maharashtra",
    type: "COCO",
    status: "Operational",
    openingDate: "2023-06-15",
    manager: "John Doe",
    improvementPoints: [],
    tasks: []
  },
  {
    id: "store-2",
    name: "Delhi South Store", 
    location: "Delhi, India",
    type: "FOFO",
    status: "Operational",
    openingDate: "2023-09-20",
    manager: "Jane Smith",
    improvementPoints: [],
    tasks: []
  }
];

export let mockApprovalRequests: ApprovalRequest[] = [];


// --- Synchronous Data Functions ---

export async function getAllProjects(): Promise<StoreProject[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const projects = await response.json();
    return projects;
  } catch (error) {
    console.error('Error fetching projects from API:', error);
    // Return empty array instead of mock data
    return [];
  }
}

export async function updateProject(id: string, projectData: Partial<StoreProject>): Promise<StoreProject> {
  // Note: The request specified an endpoint of `/api/stores/:id`, but `/api/projects/:id` is being used
  // for consistency with other project-related functions in this file (e.g., getProjectById).
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error updating project with id ${id}:`, error);
    throw error;
  }
}

export async function getProjectById(id: string): Promise<StoreProject | undefined> {
  // Validate id to prevent sending invalid IDs to the API
  console.log('getProjectById called with id:', id);
  if (!id || id === 'undefined' || id.trim() === '') {
    console.warn('getProjectById called with invalid id:', id);
    return undefined;
  }
  
  try {
    const response = await fetch(`/api/projects/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const project = await response.json();
    return project;
  } catch (error) {
    console.error('Error fetching project from API:', error);
    return undefined;
  }
}

export function createProject(projectData: Partial<StoreProject>): StoreProject {
  // This function should use API calls in production
  console.warn('createProject called - implement proper API call');
  throw new Error("Project creation not implemented - use API");
}

export function addTaskToProject(projectId: string, taskData: Partial<Task>): Task {
  console.warn(`addTaskToProject called for ${projectId} - implement proper API call`);
  throw new Error("Task creation not implemented - use API");
}

export async function updateTaskInProject(projectId: string, taskId: string, taskData: Partial<Task>): Promise<Task> {
  // This implementation directly calls a dedicated API endpoint to update the task,
  // which is more efficient than fetching the entire project.
  console.log('Updating task in project ', projectId, 'with data:', taskData , 'taskId:', taskId );
  try {
    // The API endpoint should ideally be something like `/api/projects/:projectId/tasks/:taskId`
    // or `/api/tasks/:taskId` if tasks are globally unique. /api/tasks/:projectId/:taskId
    const response = await fetch(`/tasks/${projectId}/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating task ${taskId} in project ${projectId}:`, error);
    throw error; // Re-throw the error to be handled by the calling UI code.
  }
}


export function addDocumentToProject(projectId: string, documentData: FormData): DocumentFile {
  const project = mockProjects.find(p => p.id === projectId);
  if (!project) throw new Error("Project not found for adding document");

  // FormData handling is more complex for mock. We'll simplify.
  const file = documentData.get('file') as File;
  const name = documentData.get('name') as string || file?.name || 'New Document';
  const type = documentData.get('type') as DocumentFile['type'] || 'Other';
  const uploadedBy = documentData.get('uploadedBy') as string || 'System';
  const dataAiHint = documentData.get('dataAiHint') as string | undefined;
  const hodOnly = documentData.get('hodOnly') === 'true';


  const newDoc: DocumentFile = {
    id: `doc-${Date.now()}`,
    name: name,
    type: type,
    url: file ? URL.createObjectURL(file) : '#', // Create a blob URL for mock preview
    uploadedAt: formatDate(new Date()),
    uploadedBy: uploadedBy,
    uploadedById: 'mock-user-id', // Add the required uploadedById field
    size: file ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : 'N/A',
    dataAiHint: dataAiHint,
    hodOnly: hodOnly
  };
  project.documents.unshift(newDoc);
  return newDoc;
}

export function addCommentToProject(projectId: string, commentData: Partial<Comment>): Comment {
  const project = mockProjects.find(p => p.id === projectId);
  if (!project) throw new Error("Project not found for adding comment");
  const newComment: Comment = {
    id: `cmt-${Date.now()}`,
    _id: `cmt-${Date.now()}`,
    author: commentData.author || 'Anonymous',
    addedByName: commentData.addedByName || commentData.author || 'Anonymous',
    addedById: commentData.addedById,
    timestamp: commentData.timestamp || new Date().toISOString(),
    addedAt: commentData.addedAt || commentData.timestamp || new Date().toISOString(),
    text: commentData.text || '',
    avatarUrl: commentData.avatarUrl || `https://placehold.co/40x40.png?text=${(commentData.author || 'A').substring(0,1)}`,
    replies: [],
  };
  project.comments = [newComment, ...(project.comments || [])];
  return newComment;
}

export function addReplyToProjectComment(projectId: string, commentId: string, replyData: Partial<Comment>): Comment {
    const project = mockProjects.find(p => p.id === projectId);
    if (!project || !project.comments) throw new Error("Project or comments not found");

    const findAndAddReply = (comments: Comment[]): Comment | undefined => {
        for (let comment of comments) {
            const currentCommentId = comment.id || comment._id;
            if (currentCommentId === commentId) {
                const newReply: Comment = {
                    id: `rply-${Date.now()}`,
                    _id: `rply-${Date.now()}`,
                    author: replyData.author || 'Anonymous',
                    addedByName: replyData.addedByName || replyData.author || 'Anonymous',
                    addedById: replyData.addedById,
                    timestamp: replyData.timestamp || new Date().toISOString(),
                    addedAt: replyData.addedAt || replyData.timestamp || new Date().toISOString(),
                    text: replyData.text || '',
                    avatarUrl: replyData.avatarUrl || `https://placehold.co/40x40.png?text=${(replyData.author || 'A').substring(0,1)}`,
                    replies: [],
                };
                comment.replies = [newReply, ...(comment.replies || [])];
                return comment; // Return the updated parent comment
            }
            if (comment.replies && comment.replies.length > 0) {
                const updatedParent = findAndAddReply(comment.replies);
                if (updatedParent) return comment; // Propagate the top-level parent that was modified
            }
        }
        return undefined;
    };
    const updatedParentComment = findAndAddReply(project.comments);
    if (!updatedParentComment) throw new Error("Parent comment not found to add reply");
    return updatedParentComment; // Return the top-level comment that contained the reply
}

export function addMemberToProject(projectId: string, memberData: { email: string; name: string; roleInProject: string; department?: Department; avatarSeed?:string; isProjectHod: boolean }): ProjectMember {
    const project = mockProjects.find(p => p.id === projectId);
    if (!project) throw new Error("Project not found for adding member");
    
    const existingMember = project.members?.find((m: ProjectMember) => m.email === memberData.email);
    if (existingMember) throw new Error("Member already exists in this project.");

    const newMember: ProjectMember = {
      email: memberData.email,
      name: memberData.name,
      roleInProject: memberData.roleInProject,
      department: memberData.department,
      avatarSeed: memberData.avatarSeed || memberData.name.split(' ').map(n=>n[0]).join('').toLowerCase(),
      isProjectHod: memberData.isProjectHod,
    };
    project.members = [...(project.members || []), newMember];
    return newMember;
}

export function removeMemberFromProject(projectId: string, memberEmail: string): void {
    const project = mockProjects.find(p => p.id === projectId);
    if (!project || !project.members) throw new Error("Project or members list not found");
    project.members = project.members.filter(m => m.email !== memberEmail);
}


// --- Store Functions ---
export async function getAllStores(): Promise<StoreItem[]> {
  try {
    const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/stores');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const stores = await response.json();
    return stores;
  } catch (error) {
    console.error('Error fetching stores from API:', error);
    // Return empty array instead of mock data
    return [];
  }
}

export async function getStoreById(id: string): Promise<StoreItem | undefined> {
  // Validate id to prevent sending invalid IDs to the API
  if (!id || id === 'undefined' || id.trim() === '') {
    console.warn('getStoreById called with invalid id:', id);
    return undefined;
  }
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores/${id}`); // api/stores/:id
    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const store = await response.json();
    return store;
  } catch (error) {
    console.error('Error fetching store from API:', error);
    return undefined;
  }
}

export function updateStore(id: string, storeData: Partial<StoreItem>): StoreItem {
  // This function should use API calls in production
  console.warn(`updateStore called for ${id} - implement proper API call`);
  throw new Error("Store update not implemented - use API");
}

export function createStore(storeData: Partial<StoreItem>): StoreItem {
  // This function should use API calls in production
  console.warn(`createStore called - implement proper API call`);
  throw new Error("Store creation not implemented - use API");
}

export async function addImprovementPointToStore(storeId: string, pointData: Partial<ImprovementPoint>): Promise<ImprovementPoint> {
   console.log(storeId, pointData);   
  const store = await getStoreById(storeId);
    if (!store) throw new Error("Store not found");
    const newPoint: ImprovementPoint = {
        id: `imp-${Date.now()}`,
        text: pointData.text || "New Improvement Point",
        addedById: pointData.addedById || "system-user",
        addedBy: pointData.addedBy || "System",
        addedAt: pointData.addedAt || new Date().toISOString(),
        userAvatar: pointData.userAvatar || `https://placehold.co/40x40.png?text=S`,
        comments: [],
        isResolved: false,
        ...pointData,
    };
    store.improvementPoints = [newPoint, ...(store.improvementPoints || [])];
    return newPoint;
}

export async function updateImprovementPointInStore(storeId: string, pointId: string, pointData: Partial<ImprovementPoint>): Promise<ImprovementPoint> {
    const store = await getStoreById(storeId);
    if (!store || !store.improvementPoints) throw new Error("Store or improvement points not found");
    const pointIndex = store.improvementPoints.findIndex(p => p.id === pointId);
    if (pointIndex === -1) throw new Error("Improvement point not found");
    store.improvementPoints[pointIndex] = { ...store.improvementPoints[pointIndex], ...pointData };
    return store.improvementPoints[pointIndex];
}

export async function addCommentToImprovementPoint(storeId: string, pointId: string, commentData: Partial<Comment> & { parentCommentId?: string }): Promise<Comment> {
    const store = await getStoreById(storeId);
    if (!store || !store.improvementPoints) throw new Error("Store or improvement points not found");
    const point = store.improvementPoints.find(p => p.id === pointId);
    if (!point) throw new Error("Improvement point not found");

    const newComment: Comment = {
        id: `impcmt-${Date.now()}`,
        author: commentData.author || 'Anonymous',
        timestamp: commentData.timestamp || new Date().toISOString(),
        text: commentData.text || '',
        avatarUrl: commentData.avatarUrl || `https://placehold.co/40x40.png?text=C`,
        replies: [],
    };
    
    if (commentData.parentCommentId) {
        const findAndAddReply = (comments: Comment[]): boolean => {
            for (let c of comments) {
                if (c.id === commentData.parentCommentId) {
                    c.replies = [newComment, ...(c.replies || [])];
                    return true;
                }
                if (c.replies && findAndAddReply(c.replies)) return true;
            }
            return false;
        };
        if (!findAndAddReply(point.comments || [])) throw new Error("Parent comment for reply not found");
    } else {
        point.comments = [newComment, ...(point.comments || [])];
    }
    return newComment;
}


export async function addStoreTask(storeId: string, taskData: Partial<StoreTask>): Promise<StoreTask> {
  const store = await getStoreById(storeId);
  if (!store) throw new Error("Store not found for adding task");
  const newTask: StoreTask = {
    id: `stask-${Date.now()}`,
    storeId: storeId,
    title: taskData.title || "New Store Task",
    description: taskData.description,
    assignedTo: taskData.assignedTo,
    status: taskData.status || "Pending",
    priority: taskData.priority || "Medium",
    createdAt: taskData.createdAt || new Date().toISOString(),
    createdBy: taskData.createdBy || "System",
    dueDate: taskData.dueDate,
  };
  store.tasks = [newTask, ...(store.tasks || [])];
  return newTask;
}

export async function updateStoreTask(storeId: string, taskId: string, taskData: Partial<StoreTask>): Promise<StoreTask> {
  const store = await getStoreById(storeId);
  if (!store || !store.tasks) throw new Error("Store or tasks not found for updating task");
  const taskIndex = store.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) throw new Error("Store task not found");
  store.tasks[taskIndex] = { ...store.tasks[taskIndex], ...taskData };
  return store.tasks[taskIndex];
}

export async function deleteStoreTask(storeId: string, taskId: string): Promise<void> {
  const store = await getStoreById(storeId);
  if (!store || !store.tasks) throw new Error("Store or tasks not found for deleting task");
  store.tasks = store.tasks.filter(t => t.id !== taskId);
}


// --- Head Office Contacts --- (Already defined as mockHeadOfficeContacts)

// --- Approval Requests ---
export function getApprovalRequestsForUser(userEmail: string): { awaiting: ApprovalRequest[], submitted: ApprovalRequest[] } {
  console.warn(`getApprovalRequestsForUser called for ${userEmail} - implement proper API call`);
  return {
    awaiting: [],
    submitted: [],
  };
}

export function submitApprovalRequest(requestData: Omit<ApprovalRequest, 'id' | 'submissionDate' | 'status' | 'lastUpdateDate' | 'approvalComments'>): ApprovalRequest {
  console.warn('submitApprovalRequest called - implement proper API call');
  throw new Error("Approval request submission not implemented - use API");
}

export function updateApprovalRequestStatus(
  requestId: string,
  statusUpdate: { newStatus: ApprovalStatus; actorName: string; commentText?: string }
): ApprovalRequest {
  console.warn(`updateApprovalRequestStatus called for ${requestId} - implement proper API call`);
  throw new Error("Approval request update not implemented - use API");
}

// --- User Tasks (Aggregated from Projects) ---
export function getTasksForUser(userEmailOrName: string): Task[] {
    console.warn(`getTasksForUser called for ${userEmailOrName} - implement proper API call`);
    return [];
}
