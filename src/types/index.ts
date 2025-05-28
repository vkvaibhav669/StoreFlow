
export type Department = "Property" | "Project" | "Merchandising" | "HR" | "Marketing" | "IT";

export type TaskPriority = "High" | "Medium" | "Low" | "None";

export interface Comment {
  id: string;
  author: string;
  avatarUrl?: string;
  timestamp: string; // ISO string
  text: string;
  replies?: Comment[];
}

export interface Task {
  id: string;
  name: string;
  department: Department;
  status: "Pending" | "In Progress" | "Completed" | "Blocked";
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  description?: string;
  comments?: Comment[];
}

export interface DocumentFile {
  id: string;
  name:string;
  type: "3D Render" | "Property Document" | "Marketing Collateral" | "Other";
  url: string;
  uploadedAt: string;
  uploadedBy?: string;
  size: string;
  dataAiHint?: string;
  hodOnly?: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  date: string;
  completed: boolean;
  description?: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: "Digital" | "Offline" | "Influencer" | "Hyperlocal";
  status: "Planned" | "Ongoing" | "Completed" | "Cancelled";
  startDate: string;
  endDate: string;
  budget?: number;
}

export interface DepartmentDetails {
    notes?: string;
    tasks: Task[];
    virtualPlanUrl?: string; 
    recruitmentStatus?: string; 
    staffHired?: number; 
    totalNeeded?: number; 
    preLaunchCampaigns?: MarketingCampaign[]; 
    postLaunchCampaigns?: MarketingCampaign[]; 
}


export interface StoreProject {
  id: string;
  name: string;
  location: string;
  status: "Planning" | "Property Finalized" | "Project Kickoff" | "Execution" | "Merchandising" | "Recruitment" | "Pre-Launch Marketing" | "Launched" | "Post-Launch Marketing";
  startDate: string;
  projectedLaunchDate: string;
  currentProgress: number;
  isUpcoming?: boolean;
  propertyDetails?: {
    address: string;
    sqft: number;
    status: "Identified" | "Negotiating" | "Finalized";
    notes?: string;
  };
  projectTimeline: {
    totalDays: 45;
    currentDay: number;
    kickoffDate: string;
  };
  threeDRenderUrl?: string;
  tasks: Task[];
  documents: DocumentFile[];
  milestones: Milestone[];
  departments?: { // Made optional to allow projects with only selected departments
    property?: DepartmentDetails;
    project?: DepartmentDetails;
    merchandising?: DepartmentDetails;
    hr?: DepartmentDetails;
    marketing?: DepartmentDetails;
    it?: DepartmentDetails;
  };
  comments?: Comment[];
}

export interface User {
  id: string;
  name?: string;
  email: string;
  role: "admin" | "user" | "hod";
}

export type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "Withdrawn";

export interface ApprovalRequest {
  id: string;
  title: string;
  projectId?: string;
  projectName?: string;
  requestingDepartment: Department;
  requestorName: string;
  requestorEmail: string;
  details: string;
  approverName: string; 
  approverEmail: string; // For filtering approvals assigned to current user
  status: ApprovalStatus;
  submissionDate: string; // ISO Date string
  lastUpdateDate?: string; // ISO Date string for when status changed
  approvalComments?: Comment[]; // Comments related to the approval/rejection itself
}

export type StoreType = "COCO" | "FOFO";

export interface StoreItem {
  id: string;
  name: string;
  location: string;
  type: StoreType;
  status: "Operational" | "Under Construction" | "Planned";
  openingDate: string; // ISO Date string
  manager?: string;
  sqft?: number;
}
