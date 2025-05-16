
export type Department = "Property" | "Project" | "Merchandising" | "HR" | "Marketing" | "IT";

export type TaskPriority = "High" | "Medium" | "Low" | "None";

export interface Task {
  id: string;
  name: string;
  department: Department;
  status: "Pending" | "In Progress" | "Completed" | "Blocked";
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  description?: string;
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

export interface Comment {
  id: string;
  author: string;
  avatarUrl?: string;
  timestamp: string; // ISO string
  text: string;
  replies?: Comment[];
}

export interface DepartmentDetails {
    notes?: string;
    tasks: Task[];
    virtualPlanUrl?: string; // Specific to Merchandising
    recruitmentStatus?: string; // Specific to HR
    staffHired?: number; // Specific to HR
    totalNeeded?: number; // Specific to HR
    preLaunchCampaigns?: MarketingCampaign[]; // Specific to Marketing
    postLaunchCampaigns?: MarketingCampaign[]; // Specific to Marketing
}


export interface StoreProject {
  id: string;
  name: string;
  location: string;
  status: "Planning" | "Property Finalized" | "Project Kickoff" | "Execution" | "Merchandising" | "Recruitment" | "Pre-Launch Marketing" | "Launched" | "Post-Launch Marketing";
  startDate: string;
  projectedLaunchDate: string;
  currentProgress: number;
  isUpcoming?: boolean; // Added for upcoming projects feature
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
  departments: {
    property: DepartmentDetails;
    project: DepartmentDetails;
    merchandising: DepartmentDetails;
    hr: DepartmentDetails;
    marketing: DepartmentDetails;
    it?: DepartmentDetails; // IT department is optional
  };
  comments?: Comment[];
}

export interface User {
  id: string;
  name?: string;
  email: string;
  role: "admin" | "user" | "hod"; // Added 'hod' for consistency with previous request
  // Do NOT store password here in a real app
}

