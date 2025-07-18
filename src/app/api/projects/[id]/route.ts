import { NextResponse } from 'next/server';
import { mockProjects } from '@/lib/data';

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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate the ID parameter
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Try to get project from MongoDB first
    const mongoHelpers = await getMongoClient();
    if (mongoHelpers) {
      try {
        // Check if ID is a valid ObjectId
        if (mongoHelpers.isValidObjectId(id)) {
          // Connect to MongoDB
          const client = await mongoHelpers.clientPromise;
          const db = client.db('storeflow');
          const collection = db.collection('projects');

          // Fetch the project
          const project = await collection.findOne({ _id: mongoHelpers.toObjectId(id) });

          if (project) {
            // Return transformed project
            return NextResponse.json(mongoHelpers.transformMongoDocument(project));
          }
        }
      } catch (mongoError) {
        console.error('MongoDB error:', mongoError);
        // Fall back to mock data
      }
    }

    // Fallback to mock data
    const mockProject = mockProjects.find(p => p.id === id);
    if (mockProject) {
      return NextResponse.json(mockProject);
    }

    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}