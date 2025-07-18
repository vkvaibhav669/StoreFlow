import { NextResponse } from 'next/server';
import { mockProjects } from '@/lib/data';

// Helper function to safely get MongoDB client
async function getMongoClient() {
  try {
    const { default: clientPromise, transformMongoDocuments } = await import('@/lib/mongodb');
    return { clientPromise, transformMongoDocuments };
  } catch (error) {
    console.log('MongoDB not available, using mock data');
    return null;
  }
}

export async function GET() {
  try {
    // Try to get projects from MongoDB first
    const mongoHelpers = await getMongoClient();
    if (mongoHelpers) {
      try {
        const client = await mongoHelpers.clientPromise;
        const db = client.db("storeflow");
        const collection = db.collection("projects");
        
        const projects = await collection.find({}).toArray();
        
        if (projects && projects.length > 0) {
          return NextResponse.json(mongoHelpers.transformMongoDocuments(projects));
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