
import type { StoreProject, Task, DocumentFile, Milestone, MarketingCampaign, Comment, DepartmentDetails, ApprovalRequest, ApprovalStatus, StoreItem, StoreType, ImprovementPoint, Blocker, Department } from '@/types';

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const sampleDocs: Omit<DocumentFile, 'id'>[] = [
  { name: "Property Lease Agreement_Mumbai.pdf", type: "Property Document", url: "#", uploadedAt: formatDate(addDays(today, -10)), size: "2.5MB", uploadedBy: "Legal Team (India)", hodOnly: true },
  { name: "Mumbai_Store_Render_V3.png", type: "3D Render", url: "https://picsum.photos/seed/mumbaiRender/600/400", uploadedAt: formatDate(addDays(today, -2)), size: "5.1MB", uploadedBy: "Design Studio India", dataAiHint: "store render", hodOnly: false },
  { name: "Launch Campaign Brief_Bangalore.docx", type: "Marketing Collateral", url: "#", uploadedAt: formatDate(addDays(today, -1)), size: "1.2MB", uploadedBy: "Marketing Team India" },
  { name: "Confidential Strategy Doc_India.pdf", type: "Other", url: "#", uploadedAt: formatDate(addDays(today, -5)), size: "750KB", uploadedBy: "Management India", hodOnly: true },
];

const sampleMilestones: Omit<Milestone, 'id'>[] = [
  { name: "Project Kickoff (India)", date: formatDate(today), completed: true, description: "Official start of the project in India." },
  { name: "Design Approval (India)", date: formatDate(addDays(today, 7)), completed: false, description: "3D Renders and layout approved for Indian market." },
  { name: "Mid-Project Review (India)", date: formatDate(addDays(today, 22)), completed: false, description: "Assessment of progress at the halfway mark." },
  { name: "Store Handover (India)", date: formatDate(addDays(today, 45)), completed: false, description: "Store ready for operations in India." },
];

const sampleCampaigns: Omit<MarketingCampaign, 'id'>[] = [
    { name: "Grand Opening Diwali Blast", type: "Digital", status: "Planned", startDate: formatDate(addDays(today, 30)), endDate: formatDate(addDays(today, 45)), budget: 350000 }, // INR
    { name: "Local Influencer Collab (Mumbai)", type: "Influencer", status: "Planned", startDate: formatDate(addDays(today, 35)), endDate: formatDate(addDays(today, 50)), budget: 200000 }, // INR
];

const sampleProjectComments: Comment[] = [
  {
    id: 'comment-1',
    author: 'Aisha Khan',
    avatarUrl: 'https://picsum.photos/seed/aisha/40/40',
    timestamp: addDays(today, -2).toISOString(),
    text: 'This project is looking great! Really excited about the Mumbai Central Flagship. The progress is impressive.',
    replies: [
      {
        id: 'comment-1-1',
        author: 'Sameer Gupta',
        avatarUrl: 'https://picsum.photos/seed/sameer/40/40',
        timestamp: addDays(today, -1).toISOString(),
        text: 'Agreed! The 3D render looks fantastic. The team has outdone themselves.',
        replies: [
          {
            id: 'comment-1-1-1',
            author: 'Aisha Khan',
            avatarUrl: 'https://picsum.photos/seed/aisha/40/40',
            timestamp: new Date().toISOString(),
            text: 'Thanks, Sameer! The design team did an amazing job. We should celebrate this milestone.',
          }
        ]
      },
      {
        id: 'comment-1-2',
        author: 'Sunita Rao',
        avatarUrl: 'https://picsum.photos/seed/sunita/40/40',
        timestamp: addDays(today, -1).toISOString(),
        text: 'What are the next steps for merchandising after the layout finalization for the Bangalore store?',
      }
    ],
  },
  {
    id: 'comment-2',
    author: 'Dev Mehra',
    avatarUrl: 'https://picsum.photos/seed/dev/40/40',
    timestamp: addDays(today, -1).toISOString(),
    text: 'Any updates on the Koramangala lease negotiations? Holding my breath for this one!',
  },
];

const sampleTaskComments: Comment[] = [
    {
        id: 'task-comment-1',
        author: 'Support Team India',
        avatarUrl: 'https://picsum.photos/seed/supportindia/40/40',
        timestamp: addDays(today, -1).toISOString(),
        text: 'Just a reminder that the deadline for this is approaching!',
        replies: []
    },
    {
        id: 'task-comment-2',
        author: 'Karan Malhotra', // Updated test user
        avatarUrl: 'https://picsum.photos/seed/karanTask/40/40',
        timestamp: new Date().toISOString(),
        text: 'I am on it, should be done by EOD today.',
        replies: []
    }
];


export const tasks: Task[] = [
  { id: 'task-it-001', name: 'Setup Network Infrastructure', description: 'Install routers, switches, and access points.', department: 'IT', status: 'In Progress', priority: 'High', dueDate: formatDate(addDays(today, 7)), assignedTo: "a.reddy@storeflow.corp", comments: [] }, // Arjun Reddy
  { id: 'task-it-002', name: 'Configure Point of Sale Systems', description: 'Install software and test hardware.', department: 'IT', status: 'Pending', priority: 'High', dueDate: formatDate(addDays(today, 10)), assignedTo: "karan.malhotra@storeflow.corp", comments: [...sampleTaskComments] }, // Karan Malhotra (Test User)
  { id: 'task-it-003', name: 'Employee Account Creation', description: 'Create user accounts for new staff.', department: 'IT', status: 'Completed', priority: 'Medium', dueDate: formatDate(addDays(today, -3)), assignedTo: "IT Support India", comments: [] },
  { id: 'task-hr-001', name: 'Onboarding Paperwork Review', description: 'Process new hire documentation.', department: 'HR', status: 'In Progress', priority: 'Medium', dueDate: formatDate(addDays(today, 5)), assignedTo: "r.sharma@storeflow.corp", comments: [] }, // Rohan Sharma
  { id: 'task-mkt-001', name: 'Social Media Content Calendar (India)', description: 'Plan posts for the next month.', department: 'Marketing', status: 'Pending', priority: 'Medium', dueDate: formatDate(addDays(today, 8)), assignedTo: "karan.malhotra@storeflow.corp", comments: [] }, // Karan Malhotra (Test User)
  { id: 'task-proj-001', name: 'Finalize Interior Layout (Mumbai)', department: 'Project', status: 'Completed', priority: 'High', dueDate: formatDate(addDays(today, -10)), assignedTo: "a.patel@storeflow.corp", comments: [] }, // Aditya Patel
  { id: 'task-proj-002', name: 'Source Local Contractors (Bangalore)', department: 'Project', status: 'In Progress', priority: 'High', dueDate: formatDate(addDays(today, 2)), assignedTo: "Project Coordinator India", comments: [] },
  { id: 'task-merch-001', name: 'Select Product SKUs (India Focus)', department: 'Merchandising', status: 'In Progress', priority: 'Medium', dueDate: formatDate(addDays(today, 5)), assignedTo: "a.nair@storeflow.corp", comments: [] }, // Anjali Nair
  { id: 'task-prop-001', name: 'Verify Zoning (Mumbai)', department: 'Property', status: 'Completed', priority: 'High', assignedTo: "Property Analyst India", comments: [] },
  { id: 'task-prop-002', name: 'Negotiate Lease Terms (Bangalore)', department: 'Property', status: 'In Progress', priority: 'High', dueDate: formatDate(addDays(today, 10)), assignedTo: "Legal Team India", comments: [] },
];

export let mockProjects: StoreProject[] = [
  {
    id: 'proj-001',
    name: 'Mumbai Central Flagship',
    location: '123 Nariman Point, Mumbai, India',
    status: 'Execution',
    franchiseType: 'COCO',
    startDate: formatDate(addDays(today, -15)),
    projectedLaunchDate: formatDate(addDays(today, 30)),
    currentProgress: 45,
    propertyDetails: {
      address: '123 Nariman Point, Mumbai, India',
      sqft: 2500,
      status: 'Finalized',
      notes: 'High foot traffic area, premium location in Mumbai.'
    },
    projectTimeline: {
      totalDays: 45,
      currentDay: 15,
      kickoffDate: formatDate(addDays(today, -15)),
    },
    threeDRenderUrl: 'https://picsum.photos/seed/mumbaiStore1/800/600',
    tasks: [
        ...tasks.filter(t => ['task-proj-001', 'task-merch-001', 'task-hr-001', 'task-mkt-001', 'task-prop-001', 'task-it-001'].includes(t.id)),
        { id: 'task-df-001', name: 'Review safety protocols (Mumbai)', department: 'Project', status: 'Pending', priority: 'Medium', assignedTo: 'karan.malhotra@storeflow.corp', dueDate: formatDate(addDays(today, 3)), comments: [] }
    ],
    documents: sampleDocs.map((doc, i) => ({ ...doc, id: `doc-1-${i}`})),
    milestones: sampleMilestones.map((m, i) => ({ ...m, id: `milestone-1-${i}`})),
    blockers: [
        { id: 'blk-001', title: 'Permit Delay (Mumbai)', description: 'City permit for signage is delayed by 1 week.', dateReported: formatDate(addDays(today, -3)), isResolved: false, reportedBy: 'Aditya Patel' }
    ],
    departments: {
        property: { notes: "Lease signed and secured for Mumbai.", tasks: tasks.filter(t => t.department === "Property" && ['task-prop-001'].includes(t.id)) },
        project: { notes: "Construction underway in Mumbai, on schedule.", tasks: tasks.filter(t => t.department === 'Project' && ['task-proj-001', 'task-df-001'].includes(t.id)) },
        merchandising: { virtualPlanUrl: "#", tasks: tasks.filter(t => t.department === 'Merchandising' && ['task-merch-001'].includes(t.id)) },
        hr: { recruitmentStatus: "Interviews Scheduled (Mumbai)", staffHired: 1, totalNeeded: 5, tasks: tasks.filter(t => t.department === 'HR' && ['task-hr-001'].includes(t.id)) },
        marketing: {
            preLaunchCampaigns: sampleCampaigns.map((c,i) => ({...c, id: `camp-pre-1-${i}`})),
            postLaunchCampaigns: [],
            tasks: tasks.filter(t => t.department === 'Marketing' && ['task-mkt-001'].includes(t.id))
        },
        it: { notes: "Network setup in progress for Mumbai", tasks: tasks.filter(t => t.department === 'IT' && ['task-it-001'].includes(t.id))}
    },
    comments: sampleProjectComments,
    members: [
      { email: "a.patel@storeflow.corp", name: "Aditya Patel", roleInProject: "Project Lead", department: "Projects", avatarSeed: "aditya" },
      { email: "m.desai@storeflow.corp", name: "Meera Desai", roleInProject: "Property Consultant", department: "Property", avatarSeed: "meera" },
    ],
  },
  {
    id: 'proj-002',
    name: 'Bangalore Forum Mall Outlet',
    location: '456 Koramangala, Bangalore, India',
    status: 'Planning',
    franchiseType: 'FOFO',
    startDate: formatDate(addDays(today, 5)),
    projectedLaunchDate: formatDate(addDays(today, 50)),
    currentProgress: 10,
     propertyDetails: {
      address: '456 Koramangala, Bangalore, India',
      sqft: 1800,
      status: 'Identified',
      notes: 'Good visibility in a high-traffic mall in Bangalore.'
    },
    projectTimeline: {
      totalDays: 45,
      currentDay: 0,
      kickoffDate: formatDate(addDays(today, 5)),
    },
    tasks: [
        ...tasks.filter(t => ['task-prop-002', 'task-it-002', 'task-proj-002'].includes(t.id)),
        { id: 'task-sm-001', name: 'Plan store layout mockups (Bangalore)', department: 'Project', status: 'Pending', priority: 'High', assignedTo: 'karan.malhotra@storeflow.corp', dueDate: formatDate(addDays(today, 12)), comments: [] }
    ],
    documents: [sampleDocs[0], sampleDocs[2]].map((doc, i) => ({ ...doc, id: `doc-2-${i}`})),
    milestones: [sampleMilestones[0]].map((m, i) => ({ ...m, id: `milestone-2-${i}`})),
    blockers: [],
    departments: {
        property: { notes: "Initial site visit completed in Bangalore.", tasks: tasks.filter(t => t.department === "Property" && ['task-prop-002'].includes(t.id)) },
        project: { tasks: tasks.filter(t => t.department === 'Project' && ['task-proj-002', 'task-sm-001'].includes(t.id)) },
        it: { tasks: tasks.filter(t => t.department === 'IT' && ['task-it-002'].includes(t.id))}
    },
    comments: [sampleProjectComments[1]],
    members: [],
  },
   {
    id: 'proj-003',
    name: 'Delhi T3 Airport Kiosk',
    location: 'Terminal 3, IGI Airport, Delhi, India',
    status: 'Launched',
    franchiseType: 'COCO',
    startDate: formatDate(addDays(today, -60)),
    projectedLaunchDate: formatDate(addDays(today, -15)),
    currentProgress: 100,
    propertyDetails: {
      address: 'Terminal 3, IGI Airport, Delhi, India',
      sqft: 300,
      status: 'Finalized',
      notes: 'Small footprint, high passenger flow in Delhi airport.'
    },
    projectTimeline: {
      totalDays: 45,
      currentDay: 45,
      kickoffDate: formatDate(addDays(today, -60)),
    },
    threeDRenderUrl: 'https://picsum.photos/seed/delhiKiosk/800/600',
    tasks: tasks.filter(t => t.id === 'task-it-003'),
    documents: sampleDocs.map((doc, i) => ({ ...doc, id: `doc-3-${i}`})),
    milestones: sampleMilestones.map((m, i) => ({ ...m, id: `milestone-3-${i}`, completed: true })),
    blockers: [],
    departments: {
        marketing: {
            preLaunchCampaigns: sampleCampaigns.map((c,i) => ({...c, id: `camp-pre-3-${i}`, status: "Completed"})),
            postLaunchCampaigns: [{ id: 'camp-post-3-1', name: "Loyalty Program Push (Delhi)", type: "Digital", status: "Ongoing", startDate: formatDate(addDays(today, -14)), endDate: formatDate(addDays(today, 16)), budget: 150000 }],
        },
        it: { tasks: tasks.filter(t => t.department === 'IT' && ['task-it-003'].includes(t.id))}
    },
    comments: [],
    members: [],
  }
];

export const getProjectById = (id: string): StoreProject | undefined => {
  const project = mockProjects.find(p => p.id === id);
  return project ? JSON.parse(JSON.stringify(project)) : undefined;
};

export const mockHeadOfficeContacts: {
  id: string;
  name: string;
  role: string;
  department: Department;
  email: string;
  phone: string;
  avatarSeed: string;
}[] = [
  { id: "ho-001", name: "Priya Verma", role: "Chief Executive Officer", department: "Executive Office", email: "priya.verma@storeflow.corp", phone: "(+91) 98010-00001", avatarSeed: "priya" },
  { id: "ho-002", name: "Vikram Singh", role: "Chief Operations Officer", department: "Operations", email: "vikram.singh@storeflow.corp", phone: "(+91) 98010-00002", avatarSeed: "vikram" },
  { id: "ho-003", name: "Meera Desai", role: "Head of Property Development", department: "Property", email: "meera.desai@storeflow.corp", phone: "(+91) 98010-00003", avatarSeed: "meera" },
  { id: "ho-004", name: "Aditya Patel", role: "Head of Project Management", department: "Projects", email: "aditya.patel@storeflow.corp", phone: "(+91) 98010-00004", avatarSeed: "aditya" },
  { id: "ho-005", name: "Anjali Nair", role: "Head of Merchandising", department: "Merchandising", email: "anjali.nair@storeflow.corp", phone: "(+91) 98010-00005", avatarSeed: "anjali" },
  { id: "ho-006", name: "Rohan Sharma", role: "Head of Human Resources", department: "HR", email: "rohan.sharma@storeflow.corp", phone: "(+91) 98010-00006", avatarSeed: "rohan" },
  { id: "ho-007", name: "Deepika Iyer", role: "Head of Marketing", department: "Marketing", email: "deepika.iyer@storeflow.corp", phone: "(+91) 98010-00007", avatarSeed: "deepika" },
  { id: "ho-008", name: "Arjun Reddy", role: "Head of IT", department: "IT", email: "arjun.reddy@storeflow.corp", phone: "(+91) 98010-00008", avatarSeed: "arjun" },
];


export let mockApprovalRequests: ApprovalRequest[] = [
  {
    id: 'appr-001',
    title: "Request for Additional Budget for Q3 Marketing (Mumbai)",
    projectName: "Mumbai Central Flagship",
    projectId: "proj-001",
    requestingDepartment: "Marketing",
    requestorName: "Karan Malhotra (Test User)",
    requestorEmail: "karan.malhotra@storeflow.corp",
    details: "Need an additional ₹3,00,000 for targeted social media ads to boost pre-launch awareness for Mumbai. Expected ROI is an increase in footfall by 15% during opening week.",
    approverName: "Deepika Iyer", // Head of Marketing
    approverEmail: "deepika.iyer@storeflow.corp",
    status: "Pending",
    submissionDate: formatDate(addDays(today, -2)),
  },
  {
    id: 'appr-002',
    title: "Approval for New Vendor Contract (Security Services, Bangalore)",
    projectName: "Bangalore Forum Mall Outlet",
    projectId: "proj-002",
    requestingDepartment: "Project",
    requestorName: "Rajesh Kumar", // Example project coordinator
    requestorEmail: "rajesh.kumar@storeflow.corp",
    details: "Proposing to engage 'SecureIndia Ltd.' for on-site security during mall operating hours in Bangalore. Contract details attached.",
    approverName: "Karan Malhotra (Test User)", // Assuming test user is HOD of Projects for this
    approverEmail: "karan.malhotra@storeflow.corp",
    status: "Pending",
    submissionDate: formatDate(addDays(today, -1)),
  },
  {
    id: 'appr-003',
    title: "Request for Overtime for IT Setup (Mumbai)",
    projectName: "Mumbai Central Flagship",
    projectId: "proj-001",
    requestingDepartment: "IT",
    requestorName: "Arjun Reddy",
    requestorEmail: "arjun.reddy@storeflow.corp",
    details: "Requesting approval for 10 hours of overtime for two IT technicians to complete network setup by EOW in Mumbai.",
    approverName: "Priya Verma", // Admin
    approverEmail: "priya.verma@storeflow.corp",
    status: "Pending",
    submissionDate: formatDate(addDays(today, 0)),
  },
  {
    id: 'appr-004',
    title: "Approval for Property Lease Extension Option (Delhi)",
    projectName: "Delhi T3 Airport Kiosk",
    projectId: "proj-003",
    requestingDepartment: "Property",
    requestorName: "Karan Malhotra (Test User)",
    requestorEmail: "karan.malhotra@storeflow.corp",
    details: "Seeking approval to exercise the 1-year lease extension option for the Delhi Airport Kiosk location as per agreement.",
    approverName: "Meera Desai", // Head of Property
    approverEmail: "meera.desai@storeflow.corp",
    status: "Approved",
    submissionDate: formatDate(addDays(today, -10)),
    lastUpdateDate: formatDate(addDays(today, -8)),
  },
  {
    id: 'appr-005',
    title: "Requisition for New HR Software (India)",
    requestingDepartment: "HR",
    requestorName: "Karan Malhotra (Test User)",
    requestorEmail: "karan.malhotra@storeflow.corp",
    details: "Request to purchase 'HRFlow India Pro' software to streamline onboarding and payroll. Cost ₹1,50,000/year.",
    approverName: "Rohan Sharma", // Head of HR
    approverEmail: "rohan.sharma@storeflow.corp",
    status: "Rejected",
    submissionDate: formatDate(addDays(today, -5)),
    lastUpdateDate: formatDate(addDays(today, -3)),
    approvalComments: [{id: 'rej-comment-1', author: 'Rohan Sharma', timestamp: formatDate(addDays(today, -3)), text: 'Budget constraints this quarter. Please re-evaluate in Q4.'}]
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
  { id: 'imp-1', text: 'Improve window display appeal to attract more foot traffic in Chennai.', addedBy: 'Priya Verma', addedAt: formatDate(addDays(today, -5)), userAvatar: `https://picsum.photos/seed/priya_admin/40/40`},
  { id: 'imp-2', text: 'Staff training on new product line (Indian festive wear) scheduled for next week.', addedBy: 'Lakshmi Menon', addedAt: formatDate(addDays(today, -2)), userAvatar: `https://picsum.photos/seed/lakshmi_manager/40/40`},
];

export let mockStores: StoreItem[] = [
  {
    id: 'store-001',
    name: 'Chennai Emporium',
    location: '1 T. Nagar, Chennai, India',
    type: 'COCO',
    status: 'Operational',
    openingDate: formatDate(addDays(today, -365)),
    manager: 'Lakshmi Menon',
    sqft: 5000,
    dailySales: 80000, // INR
    customerSatisfaction: 4.5,
    inventoryLevels: { "Saree": 100, "Kurta": 50},
    currentPromotions: ["Diwali Sale 20% off"],
    improvementPoints: [...sampleImprovementPoints],
    ownershipChangeRequested: false,
  },
  {
    id: 'store-002',
    name: 'Hyderabad Hi-Tech Hub',
    location: '205 Gachibowli, Hyderabad, India',
    type: 'COCO',
    status: 'Operational',
    openingDate: formatDate(addDays(today, -180)),
    manager: 'Sanjay Joshi',
    sqft: 2500,
    dailySales: 60000, // INR
    customerSatisfaction: 4.2,
    inventoryLevels: { "Electronics": 80, "Gadgets": 120},
    currentPromotions: ["Weekend Special Buy 1 Get 1 Gadget Accessory"],
    improvementPoints: [{id: 'imp-3', text: 'Consider loyalty program for repeat customers.', addedBy: 'Priya Verma', addedAt: formatDate(addDays(today, -10)) }],
    ownershipChangeRequested: true,
  },
  {
    id: 'store-003',
    name: 'Pune Garden Plaza',
    location: '15 Kalyani Nagar, Pune, India',
    type: 'FOFO',
    status: 'Operational',
    openingDate: formatDate(addDays(today, -90)),
    manager: 'Neha Agarwal',
    sqft: 3000,
    dailySales: 65000, // INR
    customerSatisfaction: 4.7,
    inventoryLevels: { "Books": 70, "Stationery": 60},
    currentPromotions: [],
    improvementPoints: [],
    ownershipChangeRequested: false,
  },
  {
    id: 'store-004',
    name: 'Kolkata New Town Site',
    location: '77 Rajarhat, Kolkata, India',
    type: 'COCO',
    status: 'Under Construction',
    openingDate: formatDate(addDays(today, 60)),
    manager: 'TBD',
    sqft: 4000,
    improvementPoints: [],
  },
  {
    id: 'store-005',
    name: 'Jaipur Pink City Franchise',
    location: '90 Bapu Bazaar, Jaipur, India',
    type: 'FOFO',
    status: 'Planned',
    openingDate: formatDate(addDays(today, 120)),
    manager: 'Rajesh Kumar',
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

