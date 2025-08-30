

// This file defines the TypeScript types that reflect the MongoDB schema design.
// It serves as the single source of truth for data structures across the application.

// --- Core Enums & Types ---

export type Department = "Property" | "Project"| "Merchandising" | "HR"| "Marketing"| "IT"| "Finance"| "Executive Office"| "Operations" | "Visual Merchandising" ;
//"Property" | "Project" | "Merchandising" | "HR" | "Marketing" | "IT" | "Executive Office" | "Operations";
export type TaskPriority = "High" | "Medium" | "Low" | "None";
export type UserRole = "Member" | "Admin" | "SuperAdmin";
export type StoreType = "COCO" | "FOFO";
export type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "Withdrawn";
export type NotePrivacy = "public" | "private" | "shared";

// --- Main Document Schemas (Collections) ---

/**
 * Represents a user in the `users` collection.
 * The single source of truth for user identity and authentication.
 */
export interface User {
  id: string; // Corresponds to MongoDB's _id
  name: string;
  email: string; // This should be unique
  role: UserRole;
  department?: Department;
  // Note: Password hash is never sent to the client.
}

/**
 * Represents a project in the `projects` collection.
 * This is a complex document that embeds most of its related data.
 */
export interface StoreProject {
  id: string; // Corresponds to MongoDB's _id
  name: string;
  location: string;
  status: "Planning" | "Property Finalized" | "Project Kickoff" | "Execution" | "Merchandising" | "Recruitment" | "Pre-Launch Marketing" | "Launched" | "Post-Launch Marketing";
  startDate: string; // ISO String
  projectedLaunchDate: string; // ISO String
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
    totalDays: number;
    currentDay: number;
    kickoffDate: string; // ISO String
  };

  threeDRenderUrl?: string;

  // --- Embedded Arrays ---
  members: ProjectMember[];
  tasks: Task[];
  documents: DocumentFile[];
  milestones: Milestone[];
  blockers: Blocker[];
  discussion: Comment[]; // Main discussion thread for the project
  comments?: Comment[]; // Alternative field name for compatibility
  
  departments: {
    property?: DepartmentDetails;
    project?: DepartmentDetails;
    merchandising?: DepartmentDetails;
    hr?: DepartmentDetails;
    marketing?: DepartmentDetails;
    it?: DepartmentDetails;
    finance?: DepartmentDetails;
    executiveOffice?: DepartmentDetails;
    operations?: DepartmentDetails;
    visualMerchandising?: DepartmentDetails;
  };
 //["Property", "Project", "Merchandising", "HR", "Marketing", "IT", "Finance", "Executive Office", "Operations" , "Visual Merchandising"]
  createdAt?: string; // ISO String - made optional
  updatedAt?: string; // ISO String - made optional
}


/**
 * Represents an operational or planned store in the `stores` collection.
 */
export interface StoreItem {
  id: string; // Corresponds to MongoDB's _id
  name: string;
  location: string;
  type: StoreType;
  status: "Operational" | "Under Construction" | "Planned";
  openingDate: string; // ISO String
  managerId?: string; // Ref: users
  manager?: string; // Denormalized name
  sqft?: number;
  ownershipChangeRequested?: boolean;
  fromProjectId?: string; // Optional Ref: projects

  // --- Embedded Arrays ---
  improvementPoints: ImprovementPoint[];
  tasks: StoreTask[];
}


/**
 * Represents an approval request in the `approvalRequests` collection.
 */
export interface ApprovalRequest {
  id: string; // Corresponds to MongoDB's _id
  title: string;
  details: string;
  status: ApprovalStatus;
  requestorId?: string; // Ref: users
  requestorName: string; // Denormalized name
  requestorEmail?: string; // Email for compatibility
  approverId?: string; // Ref: users
  approverName: string; // Denormalized name
  approverEmail?: string; // Email for compatibility
  projectId?: string; // Optional Ref: projects
  projectName?: string; // Denormalized name
  requestingDepartment: Department;
  approvalComments?: Comment[];
  submissionDate: string; // ISO String
  lastUpdateDate?: string; // ISO String
}

/**
 * Represents a note in the `notes` collection.
 */
export interface Note {
    id: string;
    content: string;
    authorId: string; // Ref: users
    authorName: string;
    authorEmail: string;
    privacy: NotePrivacy;
    sharedWith: { userId: string; userName: string; email: string }[]; // Array of user IDs if privacy is 'shared'
    createdAt: string; // ISO String
    updatedAt: string; // ISO String
}


// --- Embedded Document Sub-types ---

/** Represents a single member within a project's `members` array. */
export interface ProjectMember {
  id?: string; // Optional ID for compatibility
  userId?: string; // Ref: users
  name: string;   // Denormalized from User document
  email: string;  // Denormalized from User document
  roleInProject?: string;
  role?: string; // For head office contacts compatibility
  department?: Department;
  isProjectHod?: boolean;
  avatarSeed?: string; // For mock UI only
  phone?: string; // For contact information
}

/** Represents a single task within a project's `tasks` array. */
export interface Task {
  _id: string;
  id: string; // Embedded documents can have their own IDs
  name: string;
  department: Department;
  status: "Pending" | "In Progress" | "Completed" | "Blocked";
  priority: TaskPriority;
  assignedToId?: string; // Ref: users
  assignedTo?: string; // For compatibility with existing code
  assignedToName?: string; // Denormalized user name
  dueDate?: string; // ISO String
  description?: string;
  comments?: Comment[]; // Task-specific comments - made optional
  createdAt?: string; // ISO String - made optional
}

/** Represents a single comment or reply, can be nested. */
export interface Comment {
  id?: string;
  _id?: string; // MongoDB ID for compatibility
  authorId?: string; // Ref: users - made optional for compatibility
  addedById?: string; // Alternative field for user ID
  author?: string;   // Denormalized user name
  addedByName?: string; // Alternative field for user name
  avatarUrl?: string; // For mock UI
  timestamp?: string;  // ISO String
  addedAt?: string; // Alternative field for timestamp
  text: string;
  replies?: Comment[];
}

/** Represents a document within a project's `documents` array. */
export interface DocumentFile {
  id: string;
  name: string;
  type: "3D Render" | "Property Document" | "Marketing Collateral" | "Other";
  url: string;
  size: string;
  uploadedById: string; // Ref: users
  uploadedBy: string;   // Denormalized name
  uploadedAt: string; // ISO String
  hodOnly?: boolean;
  dataAiHint?: string;
}

/** Represents a milestone within a project's `milestones` array. */
export interface Milestone {
  id: string;
  name: string;
  description?: string;
  date: string; // ISO String
  completed: boolean;
}

/** Represents a blocker within a project's `blockers` array. */
export interface Blocker {
  id: string;
  title: string;
  description: string;
  reportedById?: string; // Ref: users - made optional
  reportedBy: string;   // Denormalized name
  dateReported: string; // ISO String
  isResolved: boolean;
  dateResolved?: string; // ISO String
}

/** Represents department-specific details within a project. */
export interface DepartmentDetails {
    notes?: string;
    tasks: Task[]; // Note: These tasks are a subset of the main project tasks array, filtered by department.
    // Marketing-specific
    preLaunchCampaigns?: MarketingCampaign[];
    postLaunchCampaigns?: MarketingCampaign[];
    // Merchandising-specific
    virtualPlanUrl?: string;
    // HR-specific
    recruitmentStatus?: string;
    staffHired?: number;
    totalNeeded?: number;
}

/** Represents a marketing campaign within a department's details. */
export interface MarketingCampaign {
  id: string;
  name: string;
  type: "Digital" | "Offline" | "Influencer" | "Hyperlocal";
  status: "Planned" | "Ongoing" | "Completed" | "Cancelled";
  startDate: string; // ISO String
  endDate: string; // ISO String
  budget?: number;
}


// --- Store-specific Sub-types ---

/** Represents an improvement point within a store's `improvementPoints` array. */
export interface ImprovementPoint {
  id: string;
  text: string;
  addedById: string; // Ref: users
  addedBy: string;   // Denormalized user name
  addedAt: string;   // ISO String
  userAvatar?: string;
  isResolved: boolean;
  resolvedById?: string; // Ref: users
  resolvedBy?: string;
  resolvedAt?: string; // ISO String
  comments: Comment[]; // Discussion specific to this point
}

/** Represents an operational task within a store's `tasks` array. */
export interface StoreTask {
  id: string;
  storeId: string; // Ref: stores
  title: string;
  description?: string;
  assignedTo?: string; // e.g., "Store Manager", not a direct user ref
  status: "Pending" | "In Progress" | "Completed" | "Blocked";
  priority: TaskPriority;
 // createdById?: string; // Ref: users - made optional
  createdBy: string;   // Denormalized user name
  createdAt: string;   // ISO String
  dueDate?: string;     // ISO String
}

/** A utility type for tasks aggregated from all projects for a user. */
export interface UserTask extends Task {
  projectId: string;
  projectName: string;
}
