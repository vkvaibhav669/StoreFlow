
import type { StoreProject, Task, DocumentFile, Milestone, MarketingCampaign, Comment, DepartmentDetails } from '@/types';

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
  { id: 'task-it-002', name: 'Configure Point of Sale Systems', description: 'Install software and test hardware.', department: 'IT', status: 'Pending', priority: 'High', dueDate: formatDate(addDays(today, 10)), assignedTo: "Current User", comments: [...sampleTaskComments] },
  { id: 'task-it-003', name: 'Employee Account Creation', description: 'Create user accounts for new staff.', department: 'IT', status: 'Completed', priority: 'Medium', dueDate: formatDate(addDays(today, -3)), assignedTo: "IT Support", comments: [] },
  { id: 'task-hr-001', name: 'Onboarding Paperwork Review', description: 'Process new hire documentation.', department: 'HR', status: 'In Progress', priority: 'Medium', dueDate: formatDate(addDays(today, 5)), assignedTo: "HR Specialist", comments: [] },
  { id: 'task-mkt-001', name: 'Social Media Content Calendar', description: 'Plan posts for the next month.', department: 'Marketing', status: 'Pending', priority: 'Medium', dueDate: formatDate(addDays(today, 8)), assignedTo: "Current User", comments: [] },
  { id: 'task-proj-001', name: 'Finalize Interior Layout', department: 'Project', status: 'Completed', priority: 'High', dueDate: formatDate(addDays(today, -10)), assignedTo: "Project Manager", comments: [] },
  { id: 'task-proj-002', name: 'Source Local Contractors', department: 'Project', status: 'In Progress', priority: 'High', dueDate: formatDate(addDays(today, 2)), assignedTo: "Project Coordinator", comments: [] },
  { id: 'task-merch-001', name: 'Select Product SKUs', department: 'Merchandising', status: 'In Progress', priority: 'Medium', dueDate: formatDate(addDays(today, 5)), assignedTo: "Merchandising Lead", comments: [] },
  { id: 'task-prop-001', name: 'Verify Zoning', department: 'Property', status: 'Completed', priority: 'High', assignedTo: "Property Analyst", comments: [] },
  { id: 'task-prop-002', name: 'Negotiate Lease Terms', department: 'Property', status: 'In Progress', priority: 'High', dueDate: formatDate(addDays(today, 10)), assignedTo: "Legal Team", comments: [] },
];

export const mockProjects: StoreProject[] = [
  {
    id: 'proj-001',
    name: 'Downtown Flagship Store',
    location: '123 Main St, Anytown, USA',
    status: 'Execution',
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
        { id: 'task-df-001', name: 'Review safety protocols', department: 'Project', status: 'Pending', priority: 'Medium', assignedTo: 'Current User', dueDate: formatDate(addDays(today, 3)), comments: [] }
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
        it: { tasks: tasks.filter(t => t.department === 'IT' && ['task-it-001'].includes(t.id))}
    },
    comments: sampleProjectComments,
  },
  {
    id: 'proj-002',
    name: 'Suburban Mall Outlet',
    location: '456 Market Ave, Suburbia, USA',
    status: 'Planning',
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
        { id: 'task-sm-001', name: 'Plan store layout mockups', department: 'Project', status: 'Pending', priority: 'High', assignedTo: 'Current User', dueDate: formatDate(addDays(today, 12)), comments: [] }
    ],
    documents: [sampleDocs[0], sampleDocs[2]].map((doc, i) => ({ ...doc, id: `doc-2-${i}`})), // Include a mix of HOD and non-HOD
    milestones: [sampleMilestones[0]].map((m, i) => ({ ...m, id: `milestone-2-${i}`})),
    departments: {
        property: { notes: "Initial site visit completed.", tasks: tasks.filter(t => t.department === "Property" && ['task-prop-002'].includes(t.id)) },
        project: { tasks: [{ id: 'task-sm-001', name: 'Plan store layout mockups', department: 'Project', status: 'Pending', priority: 'High', assignedTo: 'Current User', dueDate: formatDate(addDays(today, 12)), comments: [] }] },
        merchandising: { tasks: [] },
        hr: { recruitmentStatus: "Pending", tasks: [] },
        marketing: { preLaunchCampaigns: [], postLaunchCampaigns: [], tasks: [] },
        it: { tasks: tasks.filter(t => t.department === 'IT' && ['task-it-002'].includes(t.id))}
    },
    comments: [sampleProjectComments[1]], 
  },
   {
    id: 'proj-003',
    name: 'Airport Kiosk',
    location: 'Terminal C, International Airport',
    status: 'Launched',
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
        property: { tasks: [] },
        project: { tasks: [] },
        merchandising: { tasks: [] },
        hr: { recruitmentStatus: "Staff Onboarded", staffHired: 2, totalNeeded: 2, tasks: [] },
        marketing: {
            preLaunchCampaigns: sampleCampaigns.map((c,i) => ({...c, id: `camp-pre-3-${i}`, status: "Completed"})),
            postLaunchCampaigns: [{ id: 'camp-post-3-1', name: "Loyalty Program Push", type: "Digital", status: "Ongoing", startDate: formatDate(addDays(today, -14)), endDate: formatDate(addDays(today, 16)), budget: 2000 }],
            tasks: []
        },
        it: { tasks: tasks.filter(t => t.department === 'IT' && ['task-it-003'].includes(t.id))}
    },
    comments: [],
  }
];

export const getProjectById = (id: string): StoreProject | undefined => {
  const project = mockProjects.find(p => p.id === id);
  // Create a deep copy to avoid modifying the original mockProjects array directly
  return project ? JSON.parse(JSON.stringify(project)) : undefined;
};
