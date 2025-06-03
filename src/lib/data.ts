
import type { StoreProject, Task, DocumentFile, Milestone, MarketingCampaign, Comment, DepartmentDetails, ApprovalRequest, ApprovalStatus, StoreItem, StoreType, ImprovementPoint } from '@/types';

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const sampleDocs: Omit<DocumentFile, 'id'>[] = [
  { name: "Property Lease Agreement.pdf", type: "Property Document", url: "#", uploadedAt: formatDate(addDays(today, -10)), size: "2.5MB", uploadedBy: "Legal Team", hodOnly: true },
  { name: "Store_Front_Render_V3.png", type: "3D Render", url: "https://picsum.photos/seed/render1/600/400", uploadedAt: formatDate(addDays(today, -2)), size: "5.1MB", uploadedBy: "Design Team", dataAiHint: "store render", hodOnly: false },
  { name: "Launch Campaign Brief.docx", type: "Marketing Collateral", url: "#", uploadedAt: formatDate(addDays(today, -1)), size: "1.2MB", uploadedBy: "Marketing Team" },
  { name: "Confidential Strategy Doc.pdf", type: "Other", url: "#", uploadedAt: formatDate(addDays(today, -5)), size: "750KB", uploadedBy: "Management", hodOnly: true },
];

const sampleMilestones: Omit<Milestone, 'id'>[] = [
  { name: "Project Kickoff", date: formatDate(today), completed: true, description: "Official start of the project." },
  { name: "Design Approval", date: formatDate(addDays(today, 7)), completed: false, description: "3D Renders and layout approved." },
  { name: "Mid-Project Review", date: formatDate(addDays(today, 22)), completed: false, description: "Assessment of progress at the halfway mark." },
  { name: "Store Handover", date: formatDate(addDays(today, 45)), completed: false, description: "Store ready for operations." },
];

const sampleCampaigns: Omit<MarketingCampaign, 'id'>[] = [
    { name: "Grand Opening Social Blast", type: "Digital", status: "Planned", startDate: formatDate(addDays(today, 30)), endDate: formatDate(addDays(today, 45)), budget: 5000 },
    { name: "Local Influencer Collab", type: "Influencer", status: "Planned", startDate: formatDate(addDays(today, 35)), endDate: formatDate(addDays(today, 50)), budget: 3000 },
];

const sampleProjectComments: Comment[] = [
  {
    id: 'comment-1',
    author: 'Alice Wonderland',
    avatarUrl: 'https://picsum.photos/seed/alice/40/40',
    timestamp: addDays(today, -2).toISOString(),
    text: 'This project is looking great! Really excited about the Downtown Flagship. The progress is impressive.',
    replies: [
      {
        id: 'comment-1-1',
        author: 'Bob The Builder',
        avatarUrl: 'https://picsum.photos/seed/bob/40/40',
        timestamp: addDays(today, -1).toISOString(),
        text: 'Agreed! The 3D render looks fantastic. The team has outdone themselves.',
        replies: [
          {
            id: 'comment-1-1-1',
            author: 'Alice Wonderland',
            avatarUrl: 'https://picsum.photos/seed/alice/40/40',
            timestamp: new Date().toISOString(),
            text: 'Thanks, Bob! The design team did an amazing job. We should celebrate this milestone.',
          }
        ]
      },
      {
        id: 'comment-1-2',
        author: 'Carol Danvers',
        avatarUrl: 'https://picsum.photos/seed/carol/40/40',
        timestamp: addDays(today, -1).toISOString(),
        text: 'What are the next steps for merchandising after the layout finalization?',
      }
    ],
  },
  {
    id: 'comment-2',
    author: 'Charlie Brown',
    avatarUrl: 'https://picsum.photos/seed/charlie/40/40',
    timestamp: addDays(today, -1).toISOString(),
    text: 'Any updates on the suburban mall outlet lease negotiations? Holding my breath for this one!',
  },
];

const sampleTaskComments: Comment[] = [
    {
        id: 'task-comment-1',
        author: 'Support Staff',
        avatarUrl: 'https://picsum.photos/seed/support/40/40',
        timestamp: addDays(today, -1).toISOString(),
        text: 'Just a reminder that the deadline for this is approaching!',
        replies: []
    },
    {
        id: 'task-comment-2',
        author: 'Current User',
        avatarUrl: 'https://picsum.photos/seed/currentUserTask/40/40',
        timestamp: new Date().toISOString(),
        text: 'I am on it, should be done by EOD today.',
        replies: []
    }
];


export const tasks: Task[] = [
  { id: 'task-it-001', name: 'Setup Network Infrastructure', description: 'Install routers, switches, and access points.', department: 'IT', status: 'In Progress', priority: 'High', dueDate: formatDate(addDays(today, 7)), assignedTo: "IT Department Lead", comments: [] },
  { id: 'task-it-002', name: 'Configure Point of Sale Systems', description: 'Install software and test hardware.', department: 'IT', status: 'Pending', priority: 'High', dueDate: formatDate(addDays(today, 10)), assignedTo: "vaibhavvrajkumar@gmail.com", comments: [...sampleTaskComments] },
  { id: 'task-it-003', name: 'Employee Account Creation', description: 'Create user accounts for new staff.', department: 'IT', status: 'Completed', priority: 'Medium', dueDate: formatDate(addDays(today, -3)), assignedTo: "IT Support", comments: [] },
  { id: 'task-hr-001', name: 'Onboarding Paperwork Review', description: 'Process new hire documentation.', department: 'HR', status: 'In Progress', priority: 'Medium', dueDate: formatDate(addDays(today, 5)), assignedTo: "HR Specialist", comments: [] },
  { id: 'task-mkt-001', name: 'Social Media Content Calendar', description: 'Plan posts for the next month.', department: 'Marketing', status: 'Pending', priority: 'Medium', dueDate: formatDate(addDays(today, 8)), assignedTo: "vaibhavvrajkumar@gmail.com", comments: [] },
  { id: 'task-proj-001', name: 'Finalize Interior Layout', department: 'Project', status: 'Completed', priority: 'High', dueDate: formatDate(addDays(today, -10)), assignedTo: "Project Manager", comments: [] },
  { id: 'task-proj-002', name: 'Source Local Contractors', department: 'Project', status: 'In Progress', priority: 'High', dueDate: formatDate(addDays(today, 2)), assignedTo: "Project Coordinator", comments: [] },
  { id: 'task-merch-001', name: 'Select Product SKUs', department: 'Merchandising', status: 'In Progress', priority: 'Medium', dueDate: formatDate(addDays(today, 5)), assignedTo: "Merchandising Lead", comments: [] },
  { id: 'task-prop-001', name: 'Verify Zoning', department: 'Property', status: 'Completed', priority: 'High', assignedTo: "Property Analyst", comments: [] },
  { id: 'task-prop-002', name: 'Negotiate Lease Terms', department: 'Property', status: 'In Progress', priority: 'High', dueDate: formatDate(addDays(today, 10)), assignedTo: "Legal Team", comments: [] },
];

export let mockProjects: StoreProject[] = [
  {
    id: 'proj-001',
    name: 'Downtown Flagship Store',
    location: '123 Main St, Anytown, USA',
    status: 'Execution',
    franchiseType: 'COCO',
    startDate: formatDate(addDays(today, -15)),
    projectedLaunchDate: formatDate(addDays(today, 30)),
    currentProgress: 45,
    propertyDetails: {
      address: '123 Main St, Anytown, USA',
      sqft: 2500,
      status: 'Finalized',
      notes: 'High foot traffic area, premium location.'
    },
    projectTimeline: {
      totalDays: 45,
      currentDay: 15,
      kickoffDate: formatDate(addDays(today, -15)),
    },
    threeDRenderUrl: 'https://picsum.photos/seed/store1render/800/600',
    tasks: [
        ...tasks.filter(t => ['task-proj-001', 'task-proj-002', 'task-merch-001', 'task-hr-001', 'task-mkt-001', 'task-prop-001', 'task-it-001'].includes(t.id)), 
        { id: 'task-df-001', name: 'Review safety protocols', department: 'Project', status: 'Pending', priority: 'Medium', assignedTo: 'vaibhavvrajkumar@gmail.com', dueDate: formatDate(addDays(today, 3)), comments: [] }
    ],
    documents: sampleDocs.map((doc, i) => ({ ...doc, id: `doc-1-${i}`})),
    milestones: sampleMilestones.map((m, i) => ({ ...m, id: `milestone-1-${i}`})),
    departments: {
        property: { notes: "Lease signed and secured.", tasks: tasks.filter(t => t.department === "Property" && ['task-prop-001'].includes(t.id)) },
        project: { notes: "Construction underway, on schedule.", tasks: tasks.filter(t => t.department === 'Project' && ['task-proj-001', 'task-proj-002', 'task-df-001'].includes(t.id)) },
        merchandising: { virtualPlanUrl: "#", tasks: tasks.filter(t => t.department === 'Merchandising' && ['task-merch-001'].includes(t.id)) },
        hr: { recruitmentStatus: "Interviews Scheduled", staffHired: 1, totalNeeded: 5, tasks: tasks.filter(t => t.department === 'HR' && ['task-hr-001'].includes(t.id)) },
        marketing: { 
            preLaunchCampaigns: sampleCampaigns.map((c,i) => ({...c, id: `camp-pre-1-${i}`})), 
            postLaunchCampaigns: [], 
            tasks: tasks.filter(t => t.department === 'Marketing' && ['task-mkt-001'].includes(t.id)) 
        },
        it: { notes: "Network setup in progress", tasks: tasks.filter(t => t.department === 'IT' && ['task-it-001'].includes(t.id))}
    },
    comments: sampleProjectComments,
  },
  {
    id: 'proj-002',
    name: 'Suburban Mall Outlet',
    location: '456 Market Ave, Suburbia, USA',
    status: 'Planning',
    franchiseType: 'FOFO',
    startDate: formatDate(addDays(today, 5)),
    projectedLaunchDate: formatDate(addDays(today, 50)),
    currentProgress: 10,
     propertyDetails: {
      address: '456 Market Ave, Suburbia, USA',
      sqft: 1800,
      status: 'Identified',
      notes: 'Good visibility in a high-traffic mall.'
    },
    projectTimeline: {
      totalDays: 45,
      currentDay: 0,
      kickoffDate: formatDate(addDays(today, 5)),
    },
    tasks: [
        ...tasks.filter(t => ['task-prop-002', 'task-it-002'].includes(t.id)), 
        { id: 'task-sm-001', name: 'Plan store layout mockups', department: 'Project', status: 'Pending', priority: 'High', assignedTo: 'vaibhavvrajkumar@gmail.com', dueDate: formatDate(addDays(today, 12)), comments: [] }
    ],
    documents: [sampleDocs[0], sampleDocs[2]].map((doc, i) => ({ ...doc, id: `doc-2-${i}`})), 
    milestones: [sampleMilestones[0]].map((m, i) => ({ ...m, id: `milestone-2-${i}`})),
    departments: {
        property: { notes: "Initial site visit completed.", tasks: tasks.filter(t => t.department === "Property" && ['task-prop-002'].includes(t.id)) },
        project: { tasks: [{ id: 'task-sm-001', name: 'Plan store layout mockups', department: 'Project', status: 'Pending', priority: 'High', assignedTo: 'vaibhavvrajkumar@gmail.com', dueDate: formatDate(addDays(today, 12)), comments: [] }] },
        it: { tasks: tasks.filter(t => t.department === 'IT' && ['task-it-002'].includes(t.id))}
    },
    comments: [sampleProjectComments[1]], 
  },
   {
    id: 'proj-003',
    name: 'Airport Kiosk',
    location: 'Terminal C, International Airport',
    status: 'Launched',
    franchiseType: 'COCO',
    startDate: formatDate(addDays(today, -60)),
    projectedLaunchDate: formatDate(addDays(today, -15)),
    currentProgress: 100,
    propertyDetails: {
      address: 'Terminal C, International Airport',
      sqft: 300,
      status: 'Finalized',
      notes: 'Small footprint, high passenger flow.'
    },
    projectTimeline: {
      totalDays: 45,
      currentDay: 45, 
      kickoffDate: formatDate(addDays(today, -60)),
    },
    threeDRenderUrl: 'https://picsum.photos/seed/kioskrender/800/600',
    tasks: tasks.filter(t => t.id === 'task-it-003'),
    documents: sampleDocs.map((doc, i) => ({ ...doc, id: `doc-3-${i}`})),
    milestones: sampleMilestones.map((m, i) => ({ ...m, id: `milestone-3-${i}`, completed: true })),
    departments: {
        marketing: {
            preLaunchCampaigns: sampleCampaigns.map((c,i) => ({...c, id: `camp-pre-3-${i}`, status: "Completed"})),
            postLaunchCampaigns: [{ id: 'camp-post-3-1', name: "Loyalty Program Push", type: "Digital", status: "Ongoing", startDate: formatDate(addDays(today, -14)), endDate: formatDate(addDays(today, 16)), budget: 2000 }],
        },
        it: { tasks: tasks.filter(t => t.department === 'IT' && ['task-it-003'].includes(t.id))}
    },
    comments: [],
  }
];

export const getProjectById = (id: string): StoreProject | undefined => {
  const project = mockProjects.find(p => p.id === id);
  return project ? JSON.parse(JSON.stringify(project)) : undefined;
};

export const mockHeadOfficeContacts = [
  { id: "ho-001", name: "Eleanor Vance", role: "Chief Executive Officer", department: "Executive Office", email: "e.vance@storeflow.corp", phone: "(555) 010-0001", avatarSeed: "eleanor" },
  { id: "ho-002", name: "Marcus Thorne", role: "Chief Operations Officer", department: "Operations", email: "m.thorne@storeflow.corp", phone: "(555) 010-0002", avatarSeed: "marcus" },
  { id: "ho-003", name: "Sophia Chen", role: "Head of Property Development", department: "Property", email: "s.chen@storeflow.corp", phone: "(555) 010-0003", avatarSeed: "sophia" },
  { id: "ho-004", name: "James Rodriguez", role: "Head of Project Management", department: "Projects", email: "j.rodriguez@storeflow.corp", phone: "(555) 010-0004", avatarSeed: "james" },
  { id: "ho-005", name: "Olivia Miller", role: "Head of Merchandising", department: "Merchandising", email: "o.miller@storeflow.corp", phone: "(555) 010-0005", avatarSeed: "olivia" },
  { id: "ho-006", name: "David Lee", role: "Head of Human Resources", department: "HR", email: "d.lee@storeflow.corp", phone: "(555) 010-0006", avatarSeed: "david" },
  { id: "ho-007", name: "Isabelle Moreau", role: "Head of Marketing", department: "Marketing", email: "i.moreau@storeflow.corp", phone: "(555) 010-0007", avatarSeed: "isabelle" },
  { id: "ho-008", name: "Kenji Tanaka", role: "Head of IT", department: "IT", email: "k.tanaka@storeflow.corp", phone: "(555) 010-0008", avatarSeed: "kenji" },
];


export let mockApprovalRequests: ApprovalRequest[] = [
  {
    id: 'appr-001',
    title: "Request for Additional Budget for Q3 Marketing",
    projectName: "Downtown Flagship Store",
    projectId: "proj-001",
    requestingDepartment: "Marketing",
    requestorName: "Vaibhav (Test User)",
    requestorEmail: "vaibhavvrajkumar@gmail.com",
    details: "Need an additional $5000 for targeted social media ads to boost pre-launch awareness. Expected ROI is an increase in footfall by 15% during opening week.",
    approverName: "Isabelle Moreau", // Head of Marketing
    approverEmail: "i.moreau@storeflow.corp",
    status: "Pending",
    submissionDate: formatDate(addDays(today, -2)),
  },
  {
    id: 'appr-002',
    title: "Approval for New Vendor Contract (Security Services)",
    projectName: "Suburban Mall Outlet",
    projectId: "proj-002",
    requestingDepartment: "Project",
    requestorName: "Project Coordinator A",
    requestorEmail: "coordinator.a@storeflow.corp",
    details: "Proposing to engage 'SecurePro Ltd.' for on-site security during mall operating hours. Contract details attached.",
    approverName: "Vaibhav (Test User)", // Assuming test user is HOD of Projects for this
    approverEmail: "vaibhavvrajkumar@gmail.com",
    status: "Pending",
    submissionDate: formatDate(addDays(today, -1)),
  },
  {
    id: 'appr-003',
    title: "Request for Overtime for IT Setup",
    projectName: "Downtown Flagship Store",
    projectId: "proj-001",
    requestingDepartment: "IT",
    requestorName: "IT Department Lead",
    requestorEmail: "it.lead@storeflow.corp",
    details: "Requesting approval for 10 hours of overtime for two IT technicians to complete network setup by EOW.",
    approverName: "Vaibhhav Raj Kumar", // Admin
    approverEmail: "vaibhhavrajkumar@gmail.com", 
    status: "Pending",
    submissionDate: formatDate(addDays(today, 0)),
  },
  {
    id: 'appr-004',
    title: "Approval for Property Lease Extension Option",
    projectName: "Airport Kiosk",
    projectId: "proj-003",
    requestingDepartment: "Property",
    requestorName: "Vaibhav (Test User)",
    requestorEmail: "vaibhavvrajkumar@gmail.com",
    details: "Seeking approval to exercise the 1-year lease extension option for the Airport Kiosk location as per agreement.",
    approverName: "Sophia Chen", // Head of Property
    approverEmail: "s.chen@storeflow.corp",
    status: "Approved",
    submissionDate: formatDate(addDays(today, -10)),
    lastUpdateDate: formatDate(addDays(today, -8)),
  },
  {
    id: 'appr-005',
    title: "Requisition for New HR Software",
    requestingDepartment: "HR",
    requestorName: "Vaibhav (Test User)",
    requestorEmail: "vaibhavvrajkumar@gmail.com",
    details: "Request to purchase 'HRFlow Pro' software to streamline onboarding and payroll. Cost $2000/year.",
    approverName: "David Lee", // Head of HR
    approverEmail: "d.lee@storeflow.corp",
    status: "Rejected",
    submissionDate: formatDate(addDays(today, -5)),
    lastUpdateDate: formatDate(addDays(today, -3)),
    approvalComments: [{id: 'rej-comment-1', author: 'David Lee', timestamp: formatDate(addDays(today, -3)), text: 'Budget constraints this quarter. Please re-evaluate in Q4.'}]
  },
];

export const updateApprovalRequestStatus = (
  requestId: string,
  newStatus: ApprovalStatus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  actorName: string, // Name of the person approving/rejecting
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  commentText?: string // Optional comment
): boolean => {
  const requestIndex = mockApprovalRequests.findIndex(req => req.id === requestId);
  if (requestIndex !== -1) {
    mockApprovalRequests[requestIndex].status = newStatus;
    mockApprovalRequests[requestIndex].lastUpdateDate = formatDate(new Date());
    // In a real app, new comments would be added to mockApprovalRequests[requestIndex].approvalComments
    // For now, we'll just update status and date.
    return true;
  }
  return false;
};

// Function to add a new approval request (used by /approval page)
export const addApprovalRequest = (request: Omit<ApprovalRequest, 'id' | 'submissionDate' | 'status'>): ApprovalRequest => {
  const newRequest: ApprovalRequest = {
    ...request,
    id: `appr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    submissionDate: formatDate(new Date()),
    status: 'Pending',
  };
  mockApprovalRequests.unshift(newRequest); // Add to the beginning of the array
  return newRequest;
};

const sampleImprovementPoints: ImprovementPoint[] = [
  { id: 'imp-1', text: 'Improve window display appeal to attract more foot traffic.', addedBy: 'Vaibhhav Raj Kumar', addedAt: formatDate(addDays(today, -5)), userAvatar: `https://picsum.photos/seed/admin/40/40`},
  { id: 'imp-2', text: 'Staff training on new product line scheduled for next week.', addedBy: 'Alice Smith', addedAt: formatDate(addDays(today, -2)), userAvatar: `https://picsum.photos/seed/alice_manager/40/40`},
];

export let mockStores: StoreItem[] = [
  { 
    id: 'store-001', 
    name: 'Flagship Central', 
    location: '1 Main Street, Big City', 
    type: 'COCO', 
    status: 'Operational', 
    openingDate: formatDate(addDays(today, -365)), 
    manager: 'Alice Smith', 
    sqft: 5000, 
    dailySales: 1200, 
    customerSatisfaction: 4.5, 
    inventoryLevels: { "Product A": 100, "Product B": 50}, 
    currentPromotions: ["Summer Sale 20% off"],
    improvementPoints: [...sampleImprovementPoints],
    ownershipChangeRequested: false,
  },
  { 
    id: 'store-002', 
    name: 'Westside Express', 
    location: '205 Commerce Ave, Big City', 
    type: 'COCO', 
    status: 'Operational', 
    openingDate: formatDate(addDays(today, -180)), 
    manager: 'Bob Johnson', 
    sqft: 2500, 
    dailySales: 850, 
    customerSatisfaction: 4.2, 
    inventoryLevels: { "Product C": 80, "Product D": 120}, 
    currentPromotions: ["Weekend Special Buy 1 Get 1"],
    improvementPoints: [{id: 'imp-3', text: 'Consider loyalty program for repeat customers.', addedBy: 'Vaibhhav Raj Kumar', addedAt: formatDate(addDays(today, -10)) }],
    ownershipChangeRequested: true,
  },
  { 
    id: 'store-003', 
    name: 'Suburbia Mart', 
    location: '15 Suburbia Drive, Small Town', 
    type: 'FOFO', 
    status: 'Operational', 
    openingDate: formatDate(addDays(today, -90)), 
    manager: 'Carol Williams', 
    sqft: 3000, 
    dailySales: 950, 
    customerSatisfaction: 4.7, 
    inventoryLevels: { "Product A": 70, "Product E": 60}, 
    currentPromotions: [],
    improvementPoints: [],
    ownershipChangeRequested: false,
  },
  { 
    id: 'store-004', 
    name: 'Downtown New Site', 
    location: '77 New Dev Ave, Big City', 
    type: 'COCO', 
    status: 'Under Construction', 
    openingDate: formatDate(addDays(today, 60)), 
    manager: 'TBD', 
    sqft: 4000,
    improvementPoints: [],
  },
  { 
    id: 'store-005', 
    name: 'East Village Franchise', 
    location: '90 Village Green, Small Town', 
    type: 'FOFO', 
    status: 'Planned', 
    openingDate: formatDate(addDays(today, 120)), 
    manager: 'David Brown', 
    sqft: 2200,
    improvementPoints: [],
  },
];


export const getStoreById = (id: string): StoreItem | undefined => {
  const store = mockStores.find(s => s.id === id);
  return store ? JSON.parse(JSON.stringify(store)) : undefined;
};

export const updateMockStore = (updatedStore: StoreItem): void => {
  const index = mockStores.findIndex(s => s.id === updatedStore.id);
  if (index !== -1) {
    mockStores[index] = updatedStore;
  }
};
