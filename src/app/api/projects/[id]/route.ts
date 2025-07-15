import { NextResponse } from 'next/server';
import clientPromise, { isValidObjectId, toObjectId, transformMongoDocument } from '@/lib/mongodb';
import { mockProjects } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Validate the ID parameter
    if (!id || id.trim() === '' || id === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Try MongoDB first if ObjectId is valid
    if (isValidObjectId(id)) {
      try {
        const client = await clientPromise;
        const db = client.db("storeflow");
        const collection = db.collection("projects");
        
        const project = await collection.findOne({ _id: toObjectId(id) });
        
        if (project) {
          return NextResponse.json(transformMongoDocument(project));
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

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}