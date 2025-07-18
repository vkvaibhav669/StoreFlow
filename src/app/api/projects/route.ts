import { NextResponse } from 'next/server';
import { mockProjects } from '@/lib/data';

export async function GET() {
  try {
    // Check if MongoDB is configured
    if (process.env.MONGODB_URI) {
      try {
        // Dynamic import to avoid module load errors when MONGODB_URI is not set
        const { default: clientPromise, transformMongoDocuments } = await import('@/lib/mongodb');
        const client = await clientPromise;
        const db = client.db("storeflow");
        const collection = db.collection("projects");
        
        const projects = await collection.find({}).toArray();
        
        if (projects && projects.length > 0) {
          return NextResponse.json(transformMongoDocuments(projects));
        }
      } catch (mongoError) {
        console.error('MongoDB error:', mongoError);
        // Fall back to mock data if MongoDB fails
      }
    }
    
    // Return the projects data from the existing mock data as fallback
    return NextResponse.json(mockProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}