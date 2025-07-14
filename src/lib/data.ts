
import type { StoreProject, Task, DocumentFile, Milestone, MarketingCampaign, Comment, ApprovalRequest, ApprovalStatus, StoreItem, ImprovementPoint, Blocker, Department, StoreTask, TaskPriority, User, ProjectMember } from '@/types';
import { format, addDays as dateFnsAddDays } from 'date-fns';

export const formatDate = (date: Date): string => date.toISOString().split('T')[0];
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// --- Mock Data with Indian Theme ---

export const mockHeadOfficeContacts: ProjectMember[] = [
  { id: 'ho-001', name: 'Rajesh Kumar', role: 'Chief Executive Officer', department: 'Executive Office', email: 'rajesh.kumar@storeflow.corp', phone: '(022) 2345-0001', avatarSeed: 'rajesh' },
  { id: 'ho-002', name: 'Anita Desai', role: 'Chief Operations Officer', department: 'Operations', email: 'anita.desai@storeflow.corp', phone: '(022) 2345-0002', avatarSeed: 'anita' },
  { id: 'ho-003', name: 'Suresh Menon', role: 'Head of Property Development', department: 'Property', email: 'suresh.menon@storeflow.corp', phone: '(022) 2345-0003', avatarSeed: 'suresh' },
  { id: 'ho-004', name: 'Deepika Iyer', role: 'Head of Project Management', department: 'Projects', email: 'deepika.iyer@storeflow.corp', phone: '(022) 2345-0004', avatarSeed: 'deepika' },
  { id: 'ho-005', name: 'Karan Malhotra', role: 'Head of Merchandising', department: 'Merchandising', email: 'karan.malhotra@storeflow.corp', phone: '(022) 2345-0005', avatarSeed: 'karan' },
  { id: 'ho-006', name: 'Sunita Joshi', role: 'Head of Human Resources', department: 'HR', email: 'sunita.joshi@storeflow.corp', phone: '(022) 2345-0006', avatarSeed: 'sunita' },
  { id: 'ho-007', name: 'Amit Varma', role: 'Head of Marketing', department: 'Marketing', email: 'amit.varma@storeflow.corp', phone: '(022) 2345-0007', avatarSeed: 'amit' },
  { id: 'ho-008', name: 'Vijay Nair', role: 'Head of IT', department: 'IT', email: 'vijay.nair@storeflow.corp', phone: '(022) 2345-0008', avatarSeed: 'vijay' },
];

const commonProjectMembers: ProjectMember[] = [
    { email: 'priya.sharma@example.com', name: 'Priya Sharma', roleInProject: 'Project Lead', department: 'Projects', avatarSeed: 'priya', isProjectHod: true, role: 'Admin' },
    { email: 'rohan.mehra@example.com', name: 'Rohan Mehra', roleInProject: 'Marketing Coordinator', department: 'Marketing', avatarSeed: 'rohan', role: 'Member' },
    { email: 'vikram.singh@example.com', name: 'Vikram Singh', roleInProject: 'IT Support', department: 'IT', avatarSeed: 'vikram', role: 'Member' },
    { email: 'neha.patel@example.com', name: 'Neha Patel', roleInProject: 'HR Specialist', department: 'HR', avatarSeed: 'neha', role: 'Admin'},
    { email: 'suresh.menon@storeflow.corp', name: 'Suresh Menon', roleInProject: 'Property Advisor', department: 'Property', avatarSeed: 'suresh_prop', role: 'Member'},
];


export let mockProjects: StoreProject[] = [
  {
    id: 'proj-001',
    name: 'Mumbai Phoenix Mall Flagship',
    location: 'Lower Parel, Mumbai, Maharashtra',
    status: 'Execution',
    startDate: formatDate(addDays(new Date(), -30)),
    projectedLaunchDate: formatDate(addDays(new Date(), 45)),
    currentProgress: 65,
    isUpcoming: false,
    franchiseType: 'COCO',
    propertyDetails: { address: 'Phoenix Mills Compound, S B Marg, Lower Parel', sqft: 5000, status: 'Finalized', notes: 'High footfall area.' },
    projectTimeline: { totalDays: 75, currentDay: 30, kickoffDate: formatDate(addDays(new Date(), -30)) },
    threeDRenderUrl: 'https://placehold.co/600x400.png',
    tasks: [
      { id: 'task-001', name: 'Finalize Lease Agreement', department: 'Property', status: 'Completed', assignedTo: 'Suresh Menon', dueDate: formatDate(addDays(new Date(), -25)), priority: 'High' },
      { id: 'task-002', name: 'Interior Design Sign-off', department: 'Project', status: 'In Progress', assignedTo: 'Deepika Iyer', dueDate: formatDate(addDays(new Date(), 5)), priority: 'High',
        comments: [
          { id: 'task-cmt-001', author: 'Priya Sharma', text: 'Deepika, can we get a status update on this? The deadline is approaching.', timestamp: addDays(new Date(), -1).toISOString(), avatarUrl: 'https://placehold.co/40x40.png?text=PS' },
          { id: 'task-cmt-002', author: 'Deepika Iyer', text: 'Working on it, Priya. Should have the final designs ready by EOD tomorrow.', timestamp: new Date().toISOString(), avatarUrl: 'https://placehold.co/40x40.png?text=DI' }
        ]
      },
      { id: 'task-003', name: 'Recruit Store Manager', department: 'HR', status: 'In Progress', assignedTo: 'Sunita Joshi', dueDate: formatDate(addDays(new Date(), 15)), priority: 'Medium' },
      { id: 'task-004', name: 'Plan Launch Campaign', department: 'Marketing', status: 'Pending', assignedTo: 'Amit Varma', dueDate: formatDate(addDays(new Date(), 30)), priority: 'High' },
    ],
    documents: [
      { id: 'doc-001', name: 'Mumbai Store Layout v3.pdf', type: 'Property Document', url: '#', uploadedAt: formatDate(addDays(new Date(), -20)), size: '2.5MB', uploadedBy: 'Suresh Menon', hodOnly: false },
      { id: 'doc-002', name: 'Store_Render_Mumbai.jpg', type: '3D Render', url: 'https://placehold.co/800x600.png', uploadedAt: formatDate(addDays(new Date(), -15)), size: '4.1MB', uploadedBy: 'Deepika Iyer', dataAiHint: 'modern store', hodOnly: true},
    ],
    milestones: [
      { id: 'm-001', name: 'Lease Signed', date: formatDate(addDays(new Date(), -28)), completed: true, description: "Property lease finalized." },
      { id: 'm-002', name: 'Construction Start', date: formatDate(addDays(new Date(), -10)), completed: false, description: "Interior work begins." },
    ],
    blockers: [
        { id: 'b-001', title: 'Material Delay', description: 'Imported tiles delayed by 1 week.', dateReported: formatDate(addDays(new Date(),-5)), isResolved: false, reportedBy: 'Deepika Iyer'}
    ],
    departments: {
      property: { tasks: [{ id: 'task-001', name: 'Finalize Lease Agreement', department: 'Property', status: 'Completed', assignedTo: 'Suresh Menon', dueDate: formatDate(addDays(new Date(), -25)), priority: 'High' }], notes: 'Lease negotiation completed.' },
      project: { tasks: [{ id: 'task-002', name: 'Interior Design Sign-off', department: 'Project', status: 'In Progress', assignedTo: 'Deepika Iyer', dueDate: formatDate(addDays(new Date(), 5)), priority: 'High' }], notes: 'Awaiting final design approval.' },
      hr: { tasks: [{ id: 'task-003', name: 'Recruit Store Manager', department: 'HR', status: 'In Progress', assignedTo: 'Sunita Joshi', dueDate: formatDate(addDays(new Date(), 15)), priority: 'Medium' }], recruitmentStatus: "Interviewing candidates" , totalNeeded: 15, staffHired: 5 },
      marketing: { tasks: [{ id: 'task-004', name: 'Plan Launch Campaign', department: 'Marketing', status: 'Pending', assignedTo: 'Amit Varma', dueDate: formatDate(addDays(new Date(), 30)), priority: 'High' }], preLaunchCampaigns: [{id: 'camp-001', name: 'Social Media Buzz', type:'Digital', status:'Planned', startDate: formatDate(addDays(new Date(), 20)), endDate: formatDate(addDays(new Date(), 45)) }]},
    },
    comments: [
      { id: 'cmt-001', author: 'Rajesh Kumar', text: 'Great progress team! Let\'s ensure we are on track for the Mumbai launch.', timestamp: addDays(new Date(), -2).toISOString(), avatarUrl: 'https://placehold.co/40x40.png?text=RK' }
    ],
    members: commonProjectMembers,
  },
  {
    id: 'proj-002',
    name: 'Delhi Connaught Place Express',
    location: 'Connaught Place, New Delhi, Delhi',
    status: 'Planning',
    startDate: formatDate(addDays(new Date(), 5)),
    projectedLaunchDate: formatDate(addDays(new Date(), 75)),
    currentProgress: 10,
    isUpcoming: true,
    franchiseType: 'FOFO',
    propertyDetails: { address: 'Block A, Connaught Place', sqft: 2500, status: 'Identified', notes: 'Seeking franchisee partner.' },
    projectTimeline: { totalDays: 70, currentDay: 5, kickoffDate: formatDate(addDays(new Date(), 5)) },
    tasks: [
        { id: 'task-005', name: 'Identify Franchisee', department: 'Property', status: 'Pending', assignedTo: 'Suresh Menon', dueDate: formatDate(addDays(new Date(), 20)), priority: 'High'}
    ],
    documents: [],
    milestones: [],
    blockers: [],
    departments: {
        property: { tasks: [{ id: 'task-005', name: 'Identify Franchisee', department: 'Property', status: 'Pending', assignedTo: 'Suresh Menon', dueDate: formatDate(addDays(new Date(), 20)), priority: 'High'}], notes: 'Initial site survey done.'}
    },
    members: [commonProjectMembers[0], commonProjectMembers[1]],
  },
  {
    id: 'proj-003',
    name: 'Bangalore Orion Mall Outlet',
    location: 'Rajajinagar, Bangalore, Karnataka',
    status: 'Launched',
    startDate: formatDate(addDays(new Date(), -90)),
    projectedLaunchDate: formatDate(addDays(new Date(), -15)),
    currentProgress: 100,
    franchiseType: 'COCO',
    propertyDetails: { address: 'Orion Mall, Brigade Gateway', sqft: 3000, status: 'Finalized' },
    projectTimeline: { totalDays: 75, currentDay: 75, kickoffDate: formatDate(addDays(new Date(), -90)) },
    tasks: [ { id: 'task-006', name: 'Post-Launch Feedback Collection', department: 'Marketing', status: 'Completed', assignedTo: 'Amit Varma', dueDate: formatDate(addDays(new Date(), -5)), priority: 'Medium'}],
    documents: [],
    milestones: [{ id: 'm-003', name: 'Store Soft Launch', date: formatDate(addDays(new Date(), -15)), completed: true, description: "Successfully launched!" }],
    departments: {
        marketing: { tasks: [{ id: 'task-006', name: 'Post-Launch Feedback Collection', department: 'Marketing', status: 'Completed', assignedTo: 'Amit Varma', dueDate: formatDate(addDays(new Date(), -5)), priority: 'Medium'}], postLaunchCampaigns: [{id: 'camp-002', name: 'Customer Loyalty Program', type:'Digital', status:'Ongoing', startDate: formatDate(addDays(new Date(), -14)), endDate: formatDate(addDays(new Date(), 20)) }]}
    },
    members: commonProjectMembers,
  },
  {
    id: 'proj-004',
    name: 'Chennai Citi Centre Store',
    location: 'Mylapore, Chennai, Tamil Nadu',
    status: 'Merchandising',
    startDate: formatDate(addDays(new Date(), -40)),
    projectedLaunchDate: formatDate(addDays(new Date(), 20)),
    currentProgress: 75,
    franchiseType: 'COCO',
    propertyDetails: { address: 'Citi Centre Mall, Dr Radha Krishnan Salai', sqft: 2800, status: 'Finalized' },
    projectTimeline: { totalDays: 60, currentDay: 40, kickoffDate: formatDate(addDays(new Date(), -40)) },
    tasks: [
      { id: 'task-007', name: 'Stock Inventory Setup', department: 'Merchandising', status: 'In Progress', assignedTo: 'Karan Malhotra', dueDate: formatDate(addDays(new Date(), 5)), priority: 'High' },
      { id: 'task-008', name: 'Visual Merchandising Display', department: 'Merchandising', status: 'Pending', assignedTo: 'Karan Malhotra', dueDate: formatDate(addDays(new Date(), 10)), priority: 'Medium' },
    ],
    documents: [],
    milestones: [{ id: 'm-004', name: 'Handover for Fit-out', date: formatDate(addDays(new Date(), -35)), completed: true }],
    departments: {
      merchandising: { tasks: [
        { id: 'task-007', name: 'Stock Inventory Setup', department: 'Merchandising', status: 'In Progress', assignedTo: 'Karan Malhotra', dueDate: formatDate(addDays(new Date(), 5)), priority: 'High' },
        { id: 'task-008', name: 'Visual Merchandising Display', department: 'Merchandising', status: 'Pending', assignedTo: 'Karan Malhotra', dueDate: formatDate(addDays(new Date(), 10)), priority: 'Medium' },
      ], virtualPlanUrl: 'chennai_store_plan_v1.url' },
    },
    members: [commonProjectMembers[0], commonProjectMembers[2], commonProjectMembers[4]],
  },
];

// Mock stores data has been moved to API endpoints
// export let mockStores: StoreItem[] = [
//   { id: 'store-001', name: 'Mumbai Phoenix Mall Flagship', location: 'Lower Parel, Mumbai, Maharashtra', type: 'COCO', status: 'Under Construction', openingDate: mockProjects[0].projectedLaunchDate, manager: 'Priya Sharma', sqft: 5000 },
//   { id: 'store-002', name: 'Bangalore Orion Mall Outlet', location: 'Rajajinagar, Bangalore, Karnataka', type: 'COCO', status: 'Operational', openingDate: formatDate(addDays(new Date(), -15)), manager: 'Rohan Mehra', sqft: 3000, dailySales: 85000, customerSatisfaction: 4.5, improvementPoints: [
//     {id: 'imp-001', text: 'Improve queue management during peak hours.', addedBy: 'Anita Desai', addedAt: addDays(new Date(), -5).toISOString(), userAvatar: 'https://placehold.co/40x40.png?text=AD', comments: [], isResolved: false},
//   ], tasks: [
//     {id: 'stask-001', storeId:'store-002', title: 'Weekly Stock Audit', assignedTo: 'Rohan Mehra', status: 'Pending', priority: 'Medium', createdAt: addDays(new Date(), -2).toISOString(), createdBy: 'Anita Desai', dueDate: formatDate(addDays(new Date(), 5)) }
//   ]},
//   { id: 'store-003', name: 'Delhi Connaught Place Express', location: 'Connaught Place, New Delhi, Delhi', type: 'FOFO', status: 'Planned', openingDate: mockProjects[1].projectedLaunchDate, sqft: 2500, ownershipChangeRequested: false },
//   { id: 'store-004', name: 'Chennai Citi Centre Store', location: 'Mylapore, Chennai, Tamil Nadu', type: 'COCO', status: 'Under Construction', openingDate: mockProjects[3].projectedLaunchDate, manager: 'Vikram Singh', sqft: 2800 },
// ];

export let mockApprovalRequests: ApprovalRequest[] = [
  { id: 'appr-001', title: 'Budget Increase for Mumbai Marketing', projectId: 'proj-001', projectName: 'Mumbai Phoenix Mall Flagship', requestingDepartment: 'Marketing', requestorName: 'Amit Varma', requestorEmail: 'amit.varma@storeflow.corp', details: 'Requesting an additional 2 Lakhs for digital marketing efforts for the Mumbai launch.', approverName: 'Rajesh Kumar', approverEmail: 'rajesh.kumar@storeflow.corp', status: 'Pending', submissionDate: formatDate(addDays(new Date(), -3))},
  { id: 'appr-002', title: 'Vendor Contract - Chennai Signage', projectId: 'proj-004', projectName: 'Chennai Citi Centre Store', requestingDepartment: 'Project', requestorName: 'Deepika Iyer', requestorEmail: 'deepika.iyer@storeflow.corp', details: 'Approval for signage vendor contract, quote attached.', approverName: 'Anita Desai', approverEmail: 'anita.desai@storeflow.corp', status: 'Approved', submissionDate: formatDate(addDays(new Date(), -7)), lastUpdateDate: formatDate(addDays(new Date(), -5))},
  { id: 'appr-003', title: 'Priya Sharma - Leave Request', requestingDepartment: 'HR', requestorName: 'Priya Sharma', requestorEmail: 'priya.sharma@example.com', details: 'Requesting 5 days leave from 15th to 19th next month.', approverName: 'Sunita Joshi', approverEmail: 'sunita.joshi@storeflow.corp', status: 'Pending', submissionDate: formatDate(addDays(new Date(), -1))},
];


// --- Synchronous Data Functions ---

export async function getAllProjects(): Promise<StoreProject[]> {
  try {
    const response = await fetch('/api/tasks');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const projects = await response.json();
    return projects;
  } catch (error) {
    console.error('Error fetching projects from API:', error);
    // Fallback to mock data if API call fails
    return [...mockProjects];
  }
}

export function getProjectById(id: string): StoreProject | undefined {
  return mockProjects.find(p => p.id === id);
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

export function removeMemberFromProject(projectId: string, memberEmail: string): void {
    const project = getProjectById(projectId);
    if (!project || !project.members) throw new Error("Project or members list not found");
    project.members = project.members.filter(m => m.email !== memberEmail);
}


// --- Store Functions ---
export async function getAllStores(): Promise<StoreItem[]> {
  const response = await fetch('/api/store');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function getStoreById(id: string): Promise<StoreItem | undefined> {
  const response = await fetch(`/api/store/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      return undefined;
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Internal store management (not exported as mock data)
// In a real app, these would be API endpoints
let internalStores: StoreItem[] = [
  { id: 'store-001', name: 'Mumbai Phoenix Mall Flagship', location: 'Lower Parel, Mumbai, Maharashtra', type: 'COCO', status: 'Under Construction', openingDate: '2025-08-28', manager: 'Priya Sharma', sqft: 5000 },
  { id: 'store-002', name: 'Bangalore Orion Mall Outlet', location: 'Rajajinagar, Bangalore, Karnataka', type: 'COCO', status: 'Operational', openingDate: '2024-12-30', manager: 'Rohan Mehra', sqft: 3000, dailySales: 85000, customerSatisfaction: 4.5, improvementPoints: [
    {id: 'imp-001', text: 'Improve queue management during peak hours.', addedBy: 'Anita Desai', addedAt: '2025-01-09T09:19:25.000Z', userAvatar: 'https://placehold.co/40x40.png?text=AD', comments: [], isResolved: false},
  ], tasks: [
    {id: 'stask-001', storeId:'store-002', title: 'Weekly Stock Audit', assignedTo: 'Rohan Mehra', status: 'Pending', priority: 'Medium', createdAt: '2025-01-12T09:19:25.000Z', createdBy: 'Anita Desai', dueDate: '2025-01-19' }
  ]},
  { id: 'store-003', name: 'Delhi Connaught Place Express', location: 'Connaught Place, New Delhi, Delhi', type: 'FOFO', status: 'Planned', openingDate: '2025-03-30', sqft: 2500, ownershipChangeRequested: false },
  { id: 'store-004', name: 'Chennai Citi Centre Store', location: 'Mylapore, Chennai, Tamil Nadu', type: 'COCO', status: 'Under Construction', openingDate: '2025-02-03', manager: 'Vikram Singh', sqft: 2800 },
];

export function updateStore(id: string, storeData: Partial<StoreItem>): StoreItem {
  const storeIndex = internalStores.findIndex(s => s.id === id);
  if (storeIndex === -1) throw new Error("Store not found");
  internalStores[storeIndex] = { ...internalStores[storeIndex], ...storeData };
  return internalStores[storeIndex];
}

export function createStore(storeData: Partial<StoreItem>): StoreItem {
    const newStore: StoreItem = {
        id: `store-${Date.now()}`,
        name: storeData.name || "New Store",
        location: storeData.location || "TBD",
        type: storeData.type || "COCO",
        status: storeData.status || "Planned",
        openingDate: storeData.openingDate || formatDate(new Date()),
        manager: storeData.manager,
        sqft: storeData.sqft,
        ownershipChangeRequested: false,
        improvementPoints: [],
        tasks: [],
    };
    internalStores.unshift(newStore);
    return newStore;
}

// Internal function to get store synchronously for management operations
function getStoreByIdSync(id: string): StoreItem | undefined {
  return internalStores.find(s => s.id === id);
}

export function addImprovementPointToStore(storeId: string, pointData: Partial<ImprovementPoint>): ImprovementPoint {
    const store = getStoreByIdSync(storeId);
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

export function updateImprovementPointInStore(storeId: string, pointId: string, pointData: Partial<ImprovementPoint>): ImprovementPoint {
    const store = getStoreByIdSync(storeId);
    if (!store || !store.improvementPoints) throw new Error("Store or improvement points not found");
    const pointIndex = store.improvementPoints.findIndex(p => p.id === pointId);
    if (pointIndex === -1) throw new Error("Improvement point not found");
    store.improvementPoints[pointIndex] = { ...store.improvementPoints[pointIndex], ...pointData };
    return store.improvementPoints[pointIndex];
}

export function addCommentToImprovementPoint(storeId: string, pointId: string, commentData: Partial<Comment> & { parentCommentId?: string }): Comment {
    const store = getStoreByIdSync(storeId);
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
  const store = getStoreByIdSync(storeId);
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
  const store = getStoreByIdSync(storeId);
  if (!store || !store.tasks) throw new Error("Store or tasks not found for updating task");
  const taskIndex = store.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) throw new Error("Store task not found");
  store.tasks[taskIndex] = { ...store.tasks[taskIndex], ...taskData };
  return store.tasks[taskIndex];
}

export function deleteStoreTask(storeId: string, taskId: string): void {
  const store = getStoreByIdSync(storeId);
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
