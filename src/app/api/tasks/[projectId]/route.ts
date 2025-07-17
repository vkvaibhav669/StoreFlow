import { NextResponse } from 'next/server';
import clientPromise, {
  isValidObjectId,
  toObjectId,
  transformMongoDocument
} from '@/lib/mongodb';
import { mockProjects } from '@/lib/data';
import type { Task } from '@/types';

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

    // Try to get tasks from MongoDB first
    try {
      const client = await clientPromise;
      const db = client.db("storeflow");
      const collection = db.collection("projects");
      
      // Check if projectId is a valid ObjectId
      if (isValidObjectId(projectId)) {
        // Fetch the specific project by ObjectId
        const project = await collection.findOne({ _id: toObjectId(projectId) });
        
        if (project) {
          const transformedProject = transformMongoDocument(project);
          return NextResponse.json(transformedProject.tasks || []);
        }
      } else {
        // For backward compatibility, also try to find by string ID
        const project = await collection.findOne({ id: projectId });
        
        if (project) {
          const transformedProject = transformMongoDocument(project);
          return NextResponse.json(transformedProject.tasks || []);
        }
      }
    } catch (mongoError) {
      console.error('MongoDB error:', mongoError);
      // Fall back to mock data if MongoDB fails
    }
    
    // Fallback to mock data
    const mockProject = mockProjects.find(p => p.id === projectId);
    if (mockProject) {
      return NextResponse.json(mockProject.tasks || []);
    }
    
    // Project not found
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
    const newTask: Task = {
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

    // Try to add task to MongoDB first
    try {
      const client = await clientPromise;
      const db = client.db("storeflow");
      const collection = db.collection("projects");
      
      let project;
      let updateResult;
      
      // Check if projectId is a valid ObjectId
      if (isValidObjectId(projectId)) {
        // First, fetch the project to get current state
        project = await collection.findOne({ _id: toObjectId(projectId) });
        if (project) {
          // Update the project with the new task
          updateResult = await collection.updateOne(
            { _id: toObjectId(projectId) },
            { $push: { tasks: newTask } }
          );
        }
      } else {
        // For backward compatibility, also try to find by string ID
        project = await collection.findOne({ id: projectId });
        if (project) {
          updateResult = await collection.updateOne(
            { id: projectId },
            { $push: { tasks: newTask } }
          );
        }
      }

      if (updateResult && updateResult.matchedCount > 0) {
        // Also update the department tasks if departments exist
        if (project && project.departments) {
          const departmentKey = taskData.department.toLowerCase();
          const departmentUpdate: any = {};
          
          // Initialize department if it doesn't exist
          if (!project.departments[departmentKey]) {
            departmentUpdate[`departments.${departmentKey}`] = {
              tasks: [newTask]
            };
          } else {
            // Add task to existing department
            departmentUpdate[`departments.${departmentKey}.tasks`] = [
              ...(project.departments[departmentKey].tasks || []),
              newTask
            ];
          }
          
          // Update the department tasks
          if (isValidObjectId(projectId)) {
            await collection.updateOne(
              { _id: toObjectId(projectId) },
              { $set: departmentUpdate }
            );
          } else {
            await collection.updateOne(
              { id: projectId },
              { $set: departmentUpdate }
            );
          }
        }
        
        return NextResponse.json(newTask, { status: 201 });
      } else {
        // Project not found in MongoDB, try mock data
        const mockProject = mockProjects.find(p => p.id === projectId);
        if (mockProject) {
          mockProject.tasks.push(newTask);
          
          // Also add to department tasks if departments exist
          if (mockProject.departments) {
            const departmentKey = taskData.department.toLowerCase() as keyof typeof mockProject.departments;
            if (mockProject.departments[departmentKey]) {
              const deptDetails = mockProject.departments[departmentKey];
              if (deptDetails) {
                deptDetails.tasks = deptDetails.tasks || [];
                deptDetails.tasks.push(newTask);
              }
            } else {
              // Initialize department if it doesn't exist
              (mockProject.departments as any)[departmentKey] = {
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
      }
    } catch (mongoError) {
      console.error('MongoDB error:', mongoError);
      
      // Fall back to mock data if MongoDB fails
      const mockProject = mockProjects.find(p => p.id === projectId);
      if (mockProject) {
        mockProject.tasks.push(newTask);
        
        // Also add to department tasks if departments exist
        if (mockProject.departments) {
          const departmentKey = taskData.department.toLowerCase() as keyof typeof mockProject.departments;
          if (mockProject.departments[departmentKey]) {
            const deptDetails = mockProject.departments[departmentKey];
            if (deptDetails) {
              deptDetails.tasks = deptDetails.tasks || [];
              deptDetails.tasks.push(newTask);
            }
          } else {
            // Initialize department if it doesn't exist
            (mockProject.departments as any)[departmentKey] = {
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
    }
  } catch (error) {
    console.error('Error adding task to project:', error);
    return NextResponse.json(
      { error: 'Failed to add task' },
      { status: 500 }
    );
  }
}