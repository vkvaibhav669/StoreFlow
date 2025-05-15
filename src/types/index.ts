
export type Department = "Property" | "Project" | "Merchandising" | "HR" | "Marketing" | "IT";

export interface Task {
  id: string;
  name: string;
  department: Department;
  status: "Pending" | "In Progress" | "Completed" | "Blocked";
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

export interface StoreProject {
  id: string;
  name: string;
  location: string;
  status: "Planning" | "Property Finalized" | "Project Kickoff" | "Execution" | "Merchandising" | "Recruitment" | "Pre-Launch Marketing" | "Launched" | "Post-Launch Marketing";
  startDate: string;
  projectedLaunchDate: string;
  currentProgress: number;
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
    property: { notes?: string; tasks: Task[] };
    project: { notes?: string; tasks: Task[] };
    merchandising: { notes?: string; virtualPlanUrl?: string; tasks: Task[] };
    hr: { recruitmentStatus: string; staffHired?: number; totalNeeded?: number; tasks: Task[] };
    marketing: { preLaunchCampaigns: MarketingCampaign[]; postLaunchCampaigns: MarketingCampaign[]; tasks: Task[] };
  };
  comments?: Comment[]; // Added comments field
}
