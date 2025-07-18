import { NextResponse } from 'next/server';
import { mockProjects } from '@/lib/data';
import type { Task } from '@/types';

// Helper function to safely get MongoDB client
async function getMongoClient() {
  try {
    const { default: clientPromise, isValidObjectId, toObjectId, transformMongoDocument } = await import('@/lib/mongodb');
    return { clientPromise, isValidObjectId, toObjectId, transformMongoDocument };
  } catch (error) {
    console.log('MongoDB not available, using mock data');
    return null;
  }
}

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
    const mongoHelpers = await getMongoClient();
    if (mongoHelpers) {
      try {
        const client = await mongoHelpers.clientPromise;
        const db = client.db("storeflow");
        const collection = db.collection("projects");
        
        // Check if projectId is a valid ObjectId
        if (mongoHelpers.isValidObjectId(projectId)) {
          // Fetch the specific project by ObjectId
          const project = await collection.findOne({ _id: mongoHelpers.toObjectId(projectId) });
          
          if (project) {
            const transformedProject = mongoHelpers.transformMongoDocument(project);
            return NextResponse.json(transformedProject.tasks || []);
          }
        } else {
          // For backward compatibility, also try to find by string ID
          const project = await collection.findOne({ id: projectId });
          
          if (project) {
            const transformedProject = mongoHelpers.transformMongoDocument(project);
            return NextResponse.json(transformedProject.tasks || []);
          }
        }
      } catch (mongoError) {
        console.error('MongoDB error:', mongoError);
        // Fall back to mock data if MongoDB fails
      }
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

    // Parse the request body to get task data
    const taskData = await request.json();

    // Validate required fields
    if (!taskData.name || !taskData.department || !taskData.assignedTo) {
      return NextResponse.json(
        { error: 'Missing required fields: name, department, and assignedTo are required' },
        { status: 400 }
      );
    }

    // Create new task object
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: taskData.name,
      department: taskData.department,
      status: taskData.status || 'Pending',
      priority: taskData.priority || 'Medium',
      assignedTo: taskData.assignedTo,
      description: taskData.description || undefined,
      dueDate: taskData.dueDate || undefined,
      comments: [],
      createdAt: new Date().toISOString(),
    };

    // Try to add task to MongoDB first
    const mongoHelpers = await getMongoClient();
    if (mongoHelpers) {
      try {
        const client = await mongoHelpers.clientPromise;
        const db = client.db("storeflow");
        const collection = db.collection("projects");
        
        let updateResult;
        
        // Check if projectId is a valid ObjectId
        if (mongoHelpers.isValidObjectId(projectId)) {
          // Update the specific project by ObjectId
          updateResult = await collection.updateOne(
            { _id: mongoHelpers.toObjectId(projectId) },
            { $push: { tasks: newTask as any } }
          );
        } else {
          // For backward compatibility, also try to find by string ID
          updateResult = await collection.updateOne(
            { id: projectId },
            { $push: { tasks: newTask as any } }
          );
        }

        if (updateResult.matchedCount > 0) {
          return NextResponse.json(newTask, { status: 201 });
        }
      } catch (mongoError) {
        console.error('MongoDB error:', mongoError);
        // Fall back to mock data if MongoDB fails
      }
    }
    
    // Fallback to mock data
    const mockProject = mockProjects.find(p => p.id === projectId);
    if (mockProject) {
      // Add task to mock project
      mockProject.tasks = mockProject.tasks || [];
      mockProject.tasks.push(newTask);
      
      // Also add to department if it exists
      if (mockProject.departments && taskData.department) {
        const deptKey = taskData.department.toLowerCase() as keyof typeof mockProject.departments;
        if (mockProject.departments[deptKey]) {
          mockProject.departments[deptKey].tasks = mockProject.departments[deptKey].tasks || [];
          mockProject.departments[deptKey].tasks.push(newTask);
        }
      }
      
      return NextResponse.json(newTask, { status: 201 });
    }
    
    // Project not found
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error creating task for project:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}