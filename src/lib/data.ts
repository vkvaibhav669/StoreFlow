
import type { StoreProject, Task, DocumentFile, Milestone, MarketingCampaign, Comment, ApprovalRequest, ApprovalStatus, StoreItem, ImprovementPoint, Blocker, Department, StoreTask, TaskPriority, User, ProjectMember } from '@/types';
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


export let mockProjects: StoreProject[] = [];

export let mockStores: StoreItem[] = [];

export let mockApprovalRequests: ApprovalRequest[] = [];


// --- Synchronous Data Functions ---

export async function getAllProjects(): Promise<StoreProject[]> {
  try {
    const response = await fetch('http://localhost:8000/api/projects');
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

export async function getProjectById(id: string): Promise<StoreProject | undefined> {
  try {
    const response = await fetch(`http://localhost:8000/api/projects/${id}`);
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
  const newProject: StoreProject = {
    id: `proj-${Date.now()}`,
    name: projectData.name || 'New Project',
    location: projectData.location || 'TBD',
    status: projectData.status || 'Planning',
    startDate: projectData.startDate || formatDate(new Date()),
    projectedLaunchDate: projectData.projectedLaunchDate || formatDate(addDays(new Date(), 90)),
    currentProgress: projectData.currentProgress || 0,
    isUpcoming: projectData.isUpcoming === undefined ? true : projectData.isUpcoming,
    franchiseType: projectData.franchiseType || 'COCO',
    propertyDetails: projectData.propertyDetails || { address: projectData.location || 'TBD', sqft: 0, status: 'Identified' },
    projectTimeline: projectData.projectTimeline || { totalDays: 60, currentDay: 0, kickoffDate: projectData.startDate || formatDate(new Date()) },
    tasks: projectData.tasks || [],
    documents: projectData.documents || [],
    milestones: projectData.milestones || [],
    blockers: projectData.blockers || [],
    departments: projectData.departments || {},
    comments: projectData.comments || [],
    members: projectData.members || [],
    ...projectData, // Spread the rest of projectData
  };
  mockProjects.unshift(newProject);
  return newProject;
}

export function updateProject(id: string, projectData: Partial<StoreProject>): StoreProject {
  const projectIndex = mockProjects.findIndex(p => p.id === id);
  if (projectIndex === -1) throw new Error("Project not found");
  mockProjects[projectIndex] = { ...mockProjects[projectIndex], ...projectData };
  return mockProjects[projectIndex];
}

export function addTaskToProject(projectId: string, taskData: Partial<Task>): Task {
  const project = getProjectById(projectId);
  if (!project) throw new Error("Project not found for adding task");
  const newTask: Task = {
    id: `task-${Date.now()}`,
    name: taskData.name || 'New Task',
    department: taskData.department || 'Project',
    status: taskData.status || 'Pending',
    priority: taskData.priority || 'Medium',
    ...taskData,
  };
  project.tasks.push(newTask);
   if (project.departments && taskData.department) {
    const deptKey = taskData.department.toLowerCase() as keyof StoreProject['departments'];
    if (project.departments[deptKey]) {
        (project.departments[deptKey] as DepartmentDetails).tasks.push(newTask);
    } else {
        if (taskData.department === "Marketing") project.departments[deptKey] = { tasks: [newTask], preLaunchCampaigns: [], postLaunchCampaigns: []};
        else project.departments[deptKey] = { tasks: [newTask] };
    }
  }
  project.currentProgress = Math.round(project.tasks.filter(t => t.status === 'Completed').length / project.tasks.length * 100);
  return newTask;
}

export function updateTaskInProject(projectId: string, taskId: string, taskData: Partial<Task>): Task {
    const project = getProjectById(projectId);
    if (!project) throw new Error("Project not found for updating task");
    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error("Task not found in project");

    const oldTask = project.tasks[taskIndex];
    const updatedTask = { ...oldTask, ...taskData };
    project.tasks[taskIndex] = updatedTask;

    // Update in department details if department changes or if task is updated
    if (project.departments) {
        // Remove from old department's task list if department changed
        if (taskData.department && taskData.department !== oldTask.department) {
            const oldDeptKey = oldTask.department.toLowerCase() as keyof StoreProject['departments'];
            if (project.departments[oldDeptKey]) {
                (project.departments[oldDeptKey] as DepartmentDetails).tasks = 
                    ((project.departments[oldDeptKey] as DepartmentDetails).tasks || []).filter(dTask => dTask.id !== taskId);
            }
        }
        // Add/Update in new department's task list
        const newDeptKey = (taskData.department || oldTask.department).toLowerCase() as keyof StoreProject['departments'];
        if (project.departments[newDeptKey]) {
            const deptTaskIndex = ((project.departments[newDeptKey] as DepartmentDetails).tasks || []).findIndex(dTask => dTask.id === taskId);
            if (deptTaskIndex !== -1) {
                (project.departments[newDeptKey] as DepartmentDetails).tasks[deptTaskIndex] = updatedTask;
            } else {
                 (project.departments[newDeptKey] as DepartmentDetails).tasks.push(updatedTask);
            }
        } else { // Department might not exist yet if newly assigned
             if (newDeptKey === "marketing") project.departments[newDeptKey] = { tasks: [updatedTask], preLaunchCampaigns: [], postLaunchCampaigns: []};
             else project.departments[newDeptKey] = { tasks: [updatedTask] };
        }
    }
    project.currentProgress = Math.round(project.tasks.filter(t => t.status === 'Completed').length / project.tasks.length * 100);
    return updatedTask;
}


export function addDocumentToProject(projectId: string, documentData: FormData): DocumentFile {
  const project = getProjectById(projectId);
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
    size: file ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : 'N/A',
    dataAiHint: dataAiHint,
    hodOnly: hodOnly
  };
  project.documents.unshift(newDoc);
  return newDoc;
}

export function addCommentToProject(projectId: string, commentData: Partial<Comment>): Comment {
  const project = getProjectById(projectId);
  if (!project) throw new Error("Project not found for adding comment");
  const newComment: Comment = {
    id: `cmt-${Date.now()}`,
    author: commentData.author || 'Anonymous',
    timestamp: commentData.timestamp || new Date().toISOString(),
    text: commentData.text || '',
    avatarUrl: commentData.avatarUrl || `https://placehold.co/40x40.png?text=${(commentData.author || 'A').substring(0,1)}`,
    replies: [],
  };
  project.comments = [newComment, ...(project.comments || [])];
  return newComment;
}

export function addReplyToProjectComment(projectId: string, commentId: string, replyData: Partial<Comment>): Comment {
    const project = getProjectById(projectId);
    if (!project || !project.comments) throw new Error("Project or comments not found");

    const findAndAddReply = (comments: Comment[]): Comment | undefined => {
        for (let comment of comments) {
            if (comment.id === commentId) {
                const newReply: Comment = {
                    id: `rply-${Date.now()}`,
                    author: replyData.author || 'Anonymous',
                    timestamp: replyData.timestamp || new Date().toISOString(),
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
    const project = getProjectById(projectId);
    if (!project) throw new Error("Project not found for adding member");
    
    const existingMember = project.members?.find(m => m.email === memberData.email);
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

export async function removeMemberFromProject(projectId: string, memberEmail: string): Promise<void> {
    const project = await getProjectById(projectId);
    if (!project || !project.members) throw new Error("Project or members list not found");
    project.members = project.members.filter(m => m.email !== memberEmail);
}


// --- Store Functions ---
export async function getAllStores(): Promise<StoreItem[]> {
  try {
    const response = await fetch('http://localhost:8000/api/store');
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
  try {
    const response = await fetch(`http://localhost:8000/api/store/${id}`);
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

export async function updateStore(id: string, storeData: Partial<StoreItem>): Promise<StoreItem> {
  try {
    const response = await fetch(`http://localhost:8000/api/store/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(storeData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const store = await response.json();
    return store;
  } catch (error) {
    console.error('Error updating store via API:', error);
    throw new Error("Store update failed");
  }
}

export async function createStore(storeData: Partial<StoreItem>): Promise<StoreItem> {
  try {
    const response = await fetch('http://localhost:8000/api/store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(storeData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const store = await response.json();
    return store;
  } catch (error) {
    console.error('Error creating store via API:', error);
    throw new Error("Store creation failed");
  }
}

export async function addImprovementPointToStore(storeId: string, pointData: Partial<ImprovementPoint>): Promise<ImprovementPoint> {
    const store = await getStoreById(storeId);
    if (!store) throw new Error("Store not found");
    const newPoint: ImprovementPoint = {
        id: `imp-${Date.now()}`,
        text: pointData.text || "New Improvement Point",
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


export function addStoreTask(storeId: string, taskData: Partial<StoreTask>): StoreTask {
  const store = getStoreById(storeId);
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

export function updateStoreTask(storeId: string, taskId: string, taskData: Partial<StoreTask>): StoreTask {
  const store = getStoreById(storeId);
  if (!store || !store.tasks) throw new Error("Store or tasks not found for updating task");
  const taskIndex = store.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) throw new Error("Store task not found");
  store.tasks[taskIndex] = { ...store.tasks[taskIndex], ...taskData };
  return store.tasks[taskIndex];
}

export function deleteStoreTask(storeId: string, taskId: string): void {
  const store = getStoreById(storeId);
  if (!store || !store.tasks) throw new Error("Store or tasks not found for deleting task");
  store.tasks = store.tasks.filter(t => t.id !== taskId);
}


// --- Head Office Contacts --- (Already defined as mockHeadOfficeContacts)

// --- Approval Requests ---
export function getApprovalRequestsForUser(userEmail: string): { awaiting: ApprovalRequest[], submitted: ApprovalRequest[] } {
  return {
    awaiting: mockApprovalRequests.filter(req => req.approverEmail === userEmail && req.status === "Pending"),
    submitted: mockApprovalRequests.filter(req => req.requestorEmail === userEmail),
  };
}

export function submitApprovalRequest(requestData: Omit<ApprovalRequest, 'id' | 'submissionDate' | 'status' | 'lastUpdateDate' | 'approvalComments'>): ApprovalRequest {
  const newRequest: ApprovalRequest = {
    id: `appr-${Date.now()}`,
    submissionDate: formatDate(new Date()),
    status: 'Pending',
    ...requestData,
  };
  mockApprovalRequests.unshift(newRequest);
  return newRequest;
}

export function updateApprovalRequestStatus(
  requestId: string,
  statusUpdate: { newStatus: ApprovalStatus; actorName: string; commentText?: string }
): ApprovalRequest {
  const requestIndex = mockApprovalRequests.findIndex(req => req.id === requestId);
  if (requestIndex === -1) throw new Error("Approval request not found");
  
  mockApprovalRequests[requestIndex].status = statusUpdate.newStatus;
  mockApprovalRequests[requestIndex].lastUpdateDate = new Date().toISOString();
  
  if (statusUpdate.commentText) {
    const newComment: Comment = {
      id: `appr-cmt-${Date.now()}`,
      author: statusUpdate.actorName,
      timestamp: new Date().toISOString(),
      text: statusUpdate.commentText,
      avatarUrl: `https://placehold.co/40x40.png?text=${statusUpdate.actorName.substring(0,1)}`,
    };
    mockApprovalRequests[requestIndex].approvalComments = [
      ...(mockApprovalRequests[requestIndex].approvalComments || []),
      newComment,
    ];
  }
  return mockApprovalRequests[requestIndex];
}

// --- User Tasks (Aggregated from Projects) ---
export function getTasksForUser(userEmailOrName: string): Task[] {
    const userTasks: Task[] = [];
    mockProjects.forEach(project => {
        project.tasks.forEach(task => {
            if (task.assignedTo?.toLowerCase() === userEmailOrName.toLowerCase() || 
                (project.members?.find(m => (m.email === userEmailOrName || m.name === userEmailOrName) && m.email === task.assignedTo))
            ) {
                userTasks.push({ ...task, projectName: project.name, projectId: project.id } as Task & {projectName: string, projectId: string});
            }
        });
    });
    return userTasks;
}
