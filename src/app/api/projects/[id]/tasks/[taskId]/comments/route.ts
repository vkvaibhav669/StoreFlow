import { NextResponse } from 'next/server';
import clientPromise, { isValidObjectId, toObjectId, transformMongoDocument } from '@/lib/mongodb';
import { mockProjects } from '@/lib/data';
import type { Comment } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await params;
    
    // Validate the parameters
    if (!id || id.trim() === '' || !taskId || taskId.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid project ID or task ID' },
        { status: 400 }
      );
    }

    // Try MongoDB first if ObjectId is valid
    if (isValidObjectId(id)) {
      try {
        const client = await clientPromise;
        const db = client.db("storeflow");
        const collection = db.collection("projects");
        
        // Find the project and task
        const project = await collection.findOne({ _id: toObjectId(id) });
        
        if (project) {
          const transformedProject = transformMongoDocument(project);
          const task = transformedProject.tasks?.find((t: any) => t.id === taskId || t._id === taskId);
          if (task) {
            return NextResponse.json(task.comments || []);
          }
        }
      } catch (mongoError) {
        console.error('MongoDB error:', mongoError);
        // Fall back to mock data if MongoDB fails
      }
    }
    
    // Fall back to mock data
    const project = mockProjects.find(p => p.id === id);
    if (project) {
      const task = project.tasks?.find(t => t.id === taskId);
      if (task) {
        return NextResponse.json(task.comments || []);
      }
    }

    return NextResponse.json(
      { error: 'Project or task not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching task comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const { id, taskId } = await params;
    
    // Validate the parameters
    if (!id || id.trim() === '' || !taskId || taskId.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid project ID or task ID' },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { author, text, authorId } = body;

    // Validate required fields
    if (!author || !text) {
      return NextResponse.json(
        { error: 'Author and text are required' },
        { status: 400 }
      );
    }

    // Create new comment
    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      authorId: authorId || undefined,
      author,
      timestamp: new Date().toISOString(),
      text,
      replies: []
    };

    // Try MongoDB first if ObjectId is valid
    if (isValidObjectId(id)) {
      try {
        const client = await clientPromise;
        const db = client.db("storeflow");
        const collection = db.collection("projects");
        
        // Find and update the specific task within the project
        const result = await collection.updateOne(
          { 
            _id: toObjectId(id),
            "tasks.id": taskId
          },
          { 
            $push: { "tasks.$.comments": newComment } as any,
            $set: { updatedAt: new Date().toISOString() }
          }
        );

        if (result.modifiedCount > 0) {
          return NextResponse.json(newComment, { status: 201 });
        }
      } catch (mongoError) {
        console.error('MongoDB error:', mongoError);
        // Fall back to mock data if MongoDB fails
      }
    }
    
    // Fall back to mock data
    const projectIndex = mockProjects.findIndex(p => p.id === id);
    if (projectIndex !== -1) {
      const taskIndex = mockProjects[projectIndex].tasks?.findIndex(t => t.id === taskId);
      if (taskIndex !== undefined && taskIndex !== -1) {
        if (!mockProjects[projectIndex].tasks![taskIndex].comments) {
          mockProjects[projectIndex].tasks![taskIndex].comments = [];
        }
        mockProjects[projectIndex].tasks![taskIndex].comments!.push(newComment);
        return NextResponse.json(newComment, { status: 201 });
      }
    }

    return NextResponse.json(
      { error: 'Project or task not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error adding task comment:', error);
    return NextResponse.json(
      { error: 'Failed to add task comment' },
      { status: 500 }
    );
  }
}