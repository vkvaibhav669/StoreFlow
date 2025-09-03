import { NextResponse } from 'next/server';
import { mockProjects } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate the ID parameter
    // || id === 'undefined'
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Check if MongoDB is configured and ID is a valid ObjectId
    if (process.env.MONGODB_URI) {
      try {
        // Dynamic import to avoid module load errors when MONGODB_URI is not set
        const { default: clientPromise, isValidObjectId, toObjectId, transformMongoDocument } = await import('@/lib/mongodb');
        
        if (isValidObjectId(id)) {
          // Connect to MongoDB
          const client = await clientPromise;
          const db = client.db('storeflow');
          const collection = db.collection('projects');

          // Fetch the project
          const project = await collection.findOne({ _id: toObjectId(id) });

          if (project) {
            return NextResponse.json(transformMongoDocument(project));
          }
        }
      } catch (mongoError) {
        console.error('MongoDB error:', mongoError);
        // Fall back to mock data if MongoDB fails
      }
    }

    // Fallback to mock data for simple string IDs or if MongoDB fails
    const project = mockProjects.find(p => p.id === id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updateData = await request.json();

    // Validate the ID parameter
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Check if MongoDB is configured and ID is a valid ObjectId
    if (process.env.MONGODB_URI) {
      try {
        // Dynamic import to avoid module load errors when MONGODB_URI is not set
        const { default: clientPromise, isValidObjectId, toObjectId, transformMongoDocument } = await import('@/lib/mongodb');
        
        if (isValidObjectId(id)) {
          // Connect to MongoDB
          const client = await clientPromise;
          const db = client.db('storeflow');
          const collection = db.collection('projects');

          // Add updatedAt timestamp
          const updatePayload = {
            ...updateData,
            updatedAt: new Date()
          };

          // Update the project
          const result = await collection.findOneAndUpdate(
            { _id: toObjectId(id) },
            { $set: updatePayload },
            { returnDocument: 'after' }
          );

          if (result) {
            return NextResponse.json(transformMongoDocument(result));
          } else {
            return NextResponse.json(
              { error: 'Project not found' },
              { status: 404 }
            );
          }
        }
      } catch (mongoError) {
        console.error('MongoDB error:', mongoError);
        // Fall back to mock data if MongoDB fails
      }
    }

    // Fallback: return mock response for development
    const existingProject = mockProjects.find(p => p.id === id);
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const updatedProject = {
      ...existingProject,
      ...updateData,
      id: id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

    