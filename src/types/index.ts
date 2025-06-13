
export type Department = "Property" | "Project" | "Merchandising" | "HR" | "Marketing" | "IT" | "Executive Office" | "Operations";

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
  assignedTo?: string; // Can be an email or a name/ID
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

export interface Blocker {
  id: string;
  title: string;
  description: string;
  dateReported: string; // ISO Date string
  isResolved: boolean;
  dateResolved?: string; // ISO Date string
  reportedBy?: string;
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

export type StoreType = "COCO" | "FOFO";

export interface ProjectMember { // This type is used for defining project team members.
                               // For general HO contacts, we might use a similar structure or a simplified one.
  id?: string; // Adding id from mockHeadOfficeContacts for consistency if used
  email: string;
  name: string;
  roleInProject?: string;
  department?: Department; // Department they belong to in general
  avatarSeed?: string;
  isProjectHod?: boolean;
  role?: string; // General role in company from mockHeadOfficeContacts - This might refer to their global role in the future
  phone?: string; // from mockHeadOfficeContacts
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
  franchiseType?: StoreType;
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
  blockers?: Blocker[];
  departments?: {
    property?: DepartmentDetails;
    project?: DepartmentDetails;
    merchandising?: DepartmentDetails;
    hr?: DepartmentDetails;
    marketing?: DepartmentDetails;
    it?: DepartmentDetails;
  };
  comments?: Comment[];
  members?: ProjectMember[];
}

export type UserRole = "Member" | "Admin" | "SuperAdmin";

export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
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
  approverEmail: string;
  status: ApprovalStatus;
  submissionDate: string;
  lastUpdateDate?: string;
  approvalComments?: Comment[];
}


export interface ImprovementPoint {
  id: string;
  text: string;
  addedBy: string;
  addedAt: string;
  userAvatar?: string;
  comments?: Comment[];
  isResolved?: boolean;
  resolvedBy?: string; // Name/email of user who resolved it
  resolvedAt?: string; // ISO timestamp
}

export interface StoreTask {
  id: string;
  storeId: string; // To link back to the store
  title: string;
  description?: string;
  assignedTo?: string; // e.g., "Store Manager", "Morning Staff"
  status: "Pending" | "In Progress" | "Completed" | "Blocked";
  priority?: TaskPriority; // Reusing existing TaskPriority type
  createdAt: string; // ISO string
  createdBy: string; // User's name or email
  dueDate?: string; // ISO string
}

export interface StoreItem {
  id: string;
  name: string;
  location: string;
  type: StoreType;
  status: "Operational" | "Under Construction" | "Planned";
  openingDate: string;
  manager?: string;
  sqft?: number;
  dailySales?: number;
  customerSatisfaction?: number;
  inventoryLevels?: Record<string, number>;
  currentPromotions?: string[];
  improvementPoints?: ImprovementPoint[];
  tasks?: StoreTask[]; // Added store-specific tasks
  ownershipChangeRequested?: boolean;
}
