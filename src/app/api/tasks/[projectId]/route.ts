import { NextResponse } from 'next/server';

// Mock projects data directly in the file for testing
const mockProjects = [
  {
    id: "project-1",
    name: "Mumbai Store Launch",
    location: "Mumbai, Maharashtra",
    status: "Planning",
    startDate: "2024-01-15",
    projectedLaunchDate: "2024-06-15",
    currentProgress: 25,
    tasks: [
      {
        id: "task-1",
        name: "Property Finalization",
        department: "Property",
        status: "In Progress",
        priority: "High",
        assignedTo: "property.manager@company.com",
        assignedToName: "Property Manager",
        dueDate: "2024-02-15",
        description: "Finalize property lease agreement",
        comments: [],
        createdAt: "2024-01-15T00:00:00Z",
      }
    ],
    departments: {
      property: {
        tasks: [
          {
            id: "task-1",
            name: "Property Finalization",
            department: "Property",
            status: "In Progress",
            priority: "High",
            assignedTo: "property.manager@company.com",
            assignedToName: "Property Manager",
            dueDate: "2024-02-15",
            description: "Finalize property lease agreement",
            comments: [],
            createdAt: "2024-01-15T00:00:00Z",
          }
        ]
      }
    }
  }
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Validate the projectId parameter
    if (!projectId || projectId.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const mockProject = mockProjects.find(p => p.id === projectId);
    if (mockProject) {
      return NextResponse.json(mockProject.tasks || []);
    }
    
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching tasks for project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Validate the projectId parameter
    if (!projectId || projectId.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Parse the request body
    const taskData = await request.json();

    // Validate required fields
    if (!taskData.name || !taskData.department) {
      return NextResponse.json(
        { error: 'Task name and department are required' },
        { status: 400 }
      );
    }

    // Create the new task with generated ID
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: taskData.name,
      department: taskData.department,
      status: taskData.status || 'Pending',
      priority: taskData.priority || 'Medium',
      assignedTo: taskData.assignedTo,
      assignedToName: taskData.assignedToName,
      dueDate: taskData.dueDate,
      description: taskData.description,
      comments: taskData.comments || [],
      createdAt: new Date().toISOString(),
    };

    // Use mock data
    const mockProject = mockProjects.find(p => p.id === projectId);
    if (mockProject) {
      mockProject.tasks.push(newTask);
      
      // Also add to department tasks if departments exist
      if (mockProject.departments) {
        const departmentKey = taskData.department.toLowerCase();
        if (mockProject.departments[departmentKey]) {
          const deptDetails = mockProject.departments[departmentKey];
          if (deptDetails) {
            deptDetails.tasks = deptDetails.tasks || [];
            deptDetails.tasks.push(newTask);
          }
        } else {
          // Initialize department if it doesn't exist
          mockProject.departments[departmentKey] = {
            tasks: [newTask]
          };
        }
      }
      
      return NextResponse.json(newTask, { status: 201 });
    }
    
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error adding task to project:', error);
    return NextResponse.json(
      { error: 'Failed to add task' },
      { status: 500 }
    );
  }
}