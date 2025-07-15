import { NextResponse } from 'next/server';
import clientPromise, { transformMongoDocuments } from '@/lib/mongodb';
import { mockProjects } from '@/lib/data';

export async function GET() {
  try {
    // Try to get projects from MongoDB first
    try {
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