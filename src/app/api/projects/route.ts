import { NextResponse } from 'next/server';
//import { mockProjects } from '@/lib/data';

export async function GET() {
  try {
    // Check if MongoDB is configured
    if (process.env.MONGODB_URI) {
      try {
        // Dynamic import to avoid module load errors when MONGODB_URI is not set
        const { default: clientPromise, transformMongoDocuments } = await import('@/lib/mongodb');
        const client = await clientPromise;
        const db = client.db("StoreFlow");
        const collection = db.collection("projects");

        const projects = await collection.find({}).toArray();

        if (projects && projects.length > 0) {
          return NextResponse.json(
            transformMongoDocuments(projects), // Replace with your actual data
            {
              status: 200,
              headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3000', // Allow requests from your frontend origin
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              },
            }
          );
        } else {
          // If no projects found, return an empty array or appropriate message
          return NextResponse.json(
            [],
            {
              status: 200,
              headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              },
            }
          );
        }
      } catch (mongoError) {
        console.error('MongoDB error during GET:', mongoError);
        return NextResponse.json(
          { error: 'Failed to fetch projects from MongoDB' },
          {
            status: 500,
            headers: {
              'Access-Control-Allow-Origin': 'http://localhost:3000',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }
    } else {
      // Fallback if MONGODB_URI is not configured (e.g., for development with mock data)
      // You might want to return mockProjects here if you uncommented it.
      console.warn('MONGODB_URI is not set. Returning an empty array.');
      return NextResponse.json(
        [],
        {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }
  } catch (error) {
    console.error('General error in GET:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
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
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    // Check if MongoDB is configured
    if (process.env.MONGODB_URI) {
      try {
        // Dynamic import to avoid module load errors when MONGODB_URI is not set
        const { default: clientPromise, transformMongoDocument } = await import('@/lib/mongodb');
        const client = await clientPromise;
        const db = client.db("StoreFlow");
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
          return NextResponse.json(
            transformMongoDocument(createdProject),
            {
              status: 201,
              headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              },
            }
          );
        } else {
          // This case should ideally not be reached if insertOne is successful
          return NextResponse.json(
            { error: 'Failed to retrieve created project' },
            {
              status: 500,
              headers: {
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              },
            }
          );
        }
      } catch (mongoError) {
        console.error('MongoDB error during POST:', mongoError);
        // Fall back to mock data if MongoDB fails or return an error
        return NextResponse.json(
          { error: 'Failed to create project in MongoDB' },
          {
            status: 500,
            headers: {
              'Access-Control-Allow-Origin': 'http://localhost:3000',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }
        );
      }
    } else {
      // Fallback: return mock response for development if MongoDB_URI is not set
      console.warn('MONGODB_URI is not set. Creating project with mock data.');
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

      return NextResponse.json(
        newProject,
        {
          status: 201,
          headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }
  } catch (error) {
    console.error('General error in POST:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}
