import { NextResponse } from 'next/server';
import { mockProjects } from '@/lib/data';
import type { Comment } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate the ID parameter
    if (!id || id.trim() === '' || id === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Check if MongoDB is configured
    if (process.env.MONGODB_URI) {
      try {
        // Dynamic import to avoid module load errors when MONGODB_URI is not set
        const { default: clientPromise, isValidObjectId, toObjectId, transformMongoDocument } = await import('@/lib/mongodb');
        
        if (isValidObjectId(id)) {
          const client = await clientPromise;
          const db = client.db("StoreFlow");
          const collection = db.collection("projects");
          
          const project = await collection.findOne({ _id: toObjectId(id) });
          
          if (project) {
            const transformedProject = transformMongoDocument(project);
            // Return comments from either 'discussion' or 'comments' field
            const comments = transformedProject.discussion || transformedProject.comments || [];
            return NextResponse.json(comments);
          }
        }
      } catch (mongoError) {
        console.error('MongoDB error:', mongoError);
        // Fall back to mock data if MongoDB fails
      }
    }
    
    // Fall back to mock data for simple string IDs or if MongoDB fails
    const project = mockProjects.find(project => project.id === id);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Return comments from either 'discussion' or 'comments' field
    const comments = project.discussion || project.comments || [];
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching project comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate the ID parameter
    if (!id || id.trim() === '' || id === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid project ID' },
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

    // Check if MongoDB is configured
    if (process.env.MONGODB_URI) {
      try {
        // Dynamic import to avoid module load errors when MONGODB_URI is not set
        const { default: clientPromise, isValidObjectId, toObjectId } = await import('@/lib/mongodb');
        
        if (isValidObjectId(id)) {
          const client = await clientPromise;
          const db = client.db("StoreFlow");
          const collection = db.collection("projects");
          
          const project = await collection.findOne({ _id: toObjectId(id) });
          
          if (project) {
            // Update the project with the new comment
            const result = await collection.updateOne(
              { _id: toObjectId(id) },
              { 
                $push: { discussion: newComment } as any,
                $set: { updatedAt: new Date().toISOString() }
              }
            );

            if (result.modifiedCount > 0) {
              return NextResponse.json(newComment, { status: 201 });
            } else {
              return NextResponse.json(
                { error: 'Failed to add comment' },
                { status: 500 }
              );
            }
          }
        }
      } catch (mongoError) {
        console.error('MongoDB error:', mongoError);
        // Fall back to mock data if MongoDB fails
      }
    }
    
    // Fall back to mock data for simple string IDs or if MongoDB fails
    const projectIndex = mockProjects.findIndex(project => project.id === id);
    
    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Add comment to mock data (in-memory only, for development)
    if (!mockProjects[projectIndex].discussion) {
      mockProjects[projectIndex].discussion = [];
    }
    mockProjects[projectIndex].discussion.push(newComment);

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error adding project comment:', error);
    return NextResponse.json(
      { error: 'Failed to add project comment' },
      { status: 500 }
    );
  }
}