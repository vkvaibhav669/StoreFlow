import { NextResponse } from 'next/server';
import { mockProjects } from '@/lib/data';
import type { Task } from '@/types';

export const dynamic = 'force-dynamic';

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

    // Try to get tasks from MongoDB first if configured
    if (process.env.MONGODB_URI) {
      try {
        // Dynamic import to avoid module load errors when MONGODB_URI is not set
        const { default: clientPromise, isValidObjectId, toObjectId, transformMongoDocument } = await import('@/lib/mongodb');
        const client = await clientPromise;
        const db = client.db("StoreFlow");
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
    const body = await request.json();
    const { name, department, priority, description, assignedTo, assignedToId, dueDate } = body;

    // Validate required fields
    if (!name || !department) {
      return NextResponse.json(
        { error: 'Name and department are required' },
        { status: 400 }
      );
    }

    // Create new task
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      department,
      status: "Pending",
      priority: priority || "Medium",
      assignedTo: assignedTo || undefined,
      assignedToId: assignedToId || undefined,
      assignedToName: assignedTo || undefined,
      dueDate: dueDate || undefined,
      description: description || undefined,
      comments: [],
      createdAt: new Date().toISOString()
    };

    // Try MongoDB first if configured and ObjectId is valid
    if (process.env.MONGODB_URI) {
      try {
        // Dynamic import to avoid module load errors when MONGODB_URI is not set
        const { default: clientPromise, isValidObjectId, toObjectId } = await import('@/lib/mongodb');
        
        if (isValidObjectId(projectId)) {
          const client = await clientPromise;
          const db = client.db("StoreFlow");
          const collection = db.collection("projects");
          
          // Find and update the project with the new task
          const result = await collection.updateOne(
            { _id: toObjectId(projectId) },
            { 
              $push: { tasks: newTask } as any,
              $set: { updatedAt: new Date().toISOString() }
            }
          );

          if (result.modifiedCount > 0) {
            return NextResponse.json(newTask, { status: 201 });
          }
        }
      } catch (mongoError) {
        console.error('MongoDB error:', mongoError);
        // Fall back to mock data if MongoDB fails
      }
    }
    
    // Fall back to mock data for simple string IDs or if MongoDB fails
    const projectIndex = mockProjects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      if (!mockProjects[projectIndex].tasks) {
        mockProjects[projectIndex].tasks = [];
      }
      mockProjects[projectIndex].tasks.push(newTask);
      return NextResponse.json(newTask, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

    