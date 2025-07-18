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

export async function POST(request: Request) {
  try {
    const projectData = await request.json();
    
    // Validate required fields
    if (!projectData.name || !projectData.location) {
      return NextResponse.json(
        { error: 'Name and location are required' },
        { status: 400 }
      );
    }

    // Check if MongoDB is configured
    if (process.env.MONGODB_URI) {
      try {
        // Dynamic import to avoid module load errors when MONGODB_URI is not set
        const { default: clientPromise, transformMongoDocument } = await import('@/lib/mongodb');
        const client = await clientPromise;
        const db = client.db("storeflow");
        const collection = db.collection("projects");
        
        // Add default values and timestamps
        const newProject = {
          ...projectData,
          status: projectData.status || 'Planning',
          currentProgress: projectData.currentProgress || 0,
          isUpcoming: projectData.isUpcoming || false,
          tasks: projectData.tasks || [],
          members: projectData.members || [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await collection.insertOne(newProject);
        const createdProject = await collection.findOne({ _id: result.insertedId });
        
        if (createdProject) {
          return NextResponse.json(transformMongoDocument(createdProject), { status: 201 });
        }
      } catch (mongoError) {
        console.error('MongoDB error:', mongoError);
        // Fall back to mock data if MongoDB fails
      }
    }
    
    // Fallback: return mock response for development
    const newProject = {
      id: `project-${Date.now()}`,
      ...projectData,
      status: projectData.status || 'Planning',
      currentProgress: projectData.currentProgress || 0,
      isUpcoming: projectData.isUpcoming || false,
      tasks: projectData.tasks || [],
      members: projectData.members || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}