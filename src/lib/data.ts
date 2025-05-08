import type { StoreProject, Task, DocumentFile, Milestone, MarketingCampaign } from '@/types';

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const commonTasks: Omit<Task, 'id' | 'department'>[] = [
  { name: "Initial Briefing", status: "Completed", dueDate: formatDate(addDays(today, -5)) },
  { name: "Weekly Sync", status: "In Progress", dueDate: formatDate(addDays(today, 2)) },
  { name: "Final Review", status: "Pending", dueDate: formatDate(addDays(today, 40)) },
];

const sampleDocs: Omit<DocumentFile, 'id'>[] = [
  { name: "Property Lease Agreement.pdf", type: "Property Document", url: "#", uploadedAt: formatDate(addDays(today, -10)), size: "2.5MB", uploadedBy: "Legal Team" },
  { name: "Store_Front_Render_V3.png", type: "3D Render", url: "https://picsum.photos/seed/render1/600/400", uploadedAt: formatDate(addDays(today, -2)), size: "5.1MB", uploadedBy: "Design Team", dataAiHint: "store render" },
  { name: "Launch Campaign Brief.docx", type: "Marketing Collateral", url: "#", uploadedAt: formatDate(addDays(today, -1)), size: "1.2MB", uploadedBy: "Marketing Team" },
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
      { id: 'task-101', name: 'Finalize Interior Layout', department: 'Project', status: 'Completed', dueDate: formatDate(addDays(today, -10)) },
      { id: 'task-102', name: 'Source Local Contractors', department: 'Project', status: 'In Progress', dueDate: formatDate(addDays(today, 2)) },
      { id: 'task-103', name: 'Select Product SKUs', department: 'Merchandising', status: 'In Progress', dueDate: formatDate(addDays(today, 5)) },
      { id: 'task-104', name: 'Post Job Openings (Manager, Staff)', department: 'HR', status: 'Pending', dueDate: formatDate(addDays(today, 1)) },
      { id: 'task-105', name: 'Develop Pre-Launch Buzz Campaign', department: 'Marketing', status: 'Pending', dueDate: formatDate(addDays(today, 10)) },
    ],
    documents: sampleDocs.map((doc, i) => ({ ...doc, id: `doc-1-${i}`})),
    milestones: sampleMilestones.map((m, i) => ({ ...m, id: `milestone-1-${i}`})),
    departments: {
      property: { notes: "Lease signed and secured.", tasks: [{id: 'task-p1', name: "Verify Zoning", department: "Property", status: "Completed"}] },
      project: { notes: "Construction underway, on schedule.", tasks: commonTasks.map((t, i) => ({ ...t, id: `task-proj1-${i}`, department: "Project" })) },
      merchandising: { virtualPlanUrl: "#", tasks: commonTasks.map((t, i) => ({ ...t, id: `task-merch1-${i}`, department: "Merchandising" })) },
      hr: { recruitmentStatus: "Interviews Scheduled", staffHired: 1, totalNeeded: 5, tasks: commonTasks.map((t, i) => ({ ...t, id: `task-hr1-${i}`, department: "HR" })) },
      marketing: { preLaunchCampaigns: sampleCampaigns.map((c,i) => ({...c, id: `camp-pre-1-${i}`})), postLaunchCampaigns: [], tasks: commonTasks.map((t, i) => ({ ...t, id: `task-mkt1-${i}`, department: "Marketing" })) },
    }
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
      { id: 'task-201', name: 'Negotiate Lease Terms', department: 'Property', status: 'In Progress', dueDate: formatDate(addDays(today, 10)) },
      { id: 'task-202', name: 'Initial Design Concept', department: 'Project', status: 'Pending', dueDate: formatDate(addDays(today, 15)) },
    ],
    documents: [sampleDocs[0]].map((doc, i) => ({ ...doc, id: `doc-2-${i}`})),
    milestones: [sampleMilestones[0]].map((m, i) => ({ ...m, id: `milestone-2-${i}`})),
    departments: {
      property: { notes: "Initial site visit completed.", tasks: [{id: 'task-p2', name: "Conduct Feasibility Study", department: "Property", status: "In Progress"}] },
      project: { tasks: commonTasks.slice(0,1).map((t, i) => ({ ...t, id: `task-proj2-${i}`, department: "Project" })) },
      merchandising: { tasks: [] },
      hr: { recruitmentStatus: "Pending", tasks: [] },
      marketing: { preLaunchCampaigns: [], postLaunchCampaigns: [], tasks: [] },
    }
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
      currentDay: 45, // Assuming it launched on day 45
      kickoffDate: formatDate(addDays(today, -60)),
    },
    threeDRenderUrl: 'https://picsum.photos/seed/kioskrender/800/600',
    tasks: [
       { id: 'task-301', name: 'Post-Launch Performance Review', department: 'Marketing', status: 'In Progress', dueDate: formatDate(addDays(today, 5)) },
    ],
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
        tasks: [{id: 'task-mkt3-1', name: "Analyze Launch Metrics", department: "Marketing", status: "In Progress"}] 
      },
    }
  }
];

export const getProjectById = (id: string): StoreProject | undefined => {
  return mockProjects.find(p => p.id === id);
};
