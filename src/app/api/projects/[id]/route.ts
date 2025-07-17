import { NextResponse } from 'next/server';
import clientPromise, {
  isValidObjectId,
  toObjectId,
  transformMongoDocument
} from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate the ID parameter
    // || id === 'undefined'
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Check if ID is a valid ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid ObjectId format' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('storeflow');
    const collection = db.collection('projects');

    // Fetch the project
    const project = await collection.findOne({ _id: toObjectId(id) });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Return transformed project
    return NextResponse.json(transformMongoDocument(project));
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}