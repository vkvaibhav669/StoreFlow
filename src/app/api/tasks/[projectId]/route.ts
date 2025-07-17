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