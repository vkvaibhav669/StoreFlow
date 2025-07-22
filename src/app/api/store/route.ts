import { NextResponse } from 'next/server';
import { mockStores } from '@/lib/data';

export async function GET() {
  try {
    // Check if MongoDB is configured
    if (process.env.MONGODB_URI) {
      try {
        // Dynamic import to avoid module load errors when MONGODB_URI is not set
        const { default: clientPromise, transformMongoDocuments } = await import('@/lib/mongodb');
        const client = await clientPromise;
        const db = client.db("StoreFlow");
        const collection = db.collection("stores");
        
        const stores = await collection.find({}).toArray();
        
        if (stores && stores.length > 0) {
          return NextResponse.json(transformMongoDocuments(stores));
        }
      } catch (mongoError) {
        console.error('MongoDB error:', mongoError);
        // Fall back to mock data if MongoDB fails
      }
    }
    
    // Return the stores data from the existing mock data as fallback
    return NextResponse.json(mockStores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const storeData = await request.json();
    
    // Validate required fields
    if (!storeData.name || !storeData.location) {
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
        const db = client.db("StoreFlow");
        const collection = db.collection("stores");
        
        // Add default values and timestamps
        const newStore = {
          ...storeData,
          status: storeData.status || 'Operational',
          openingDate: storeData.openingDate || new Date().toISOString(),
          improvementPoints: storeData.improvementPoints || [],
          tasks: storeData.tasks || [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await collection.insertOne(newStore);
        const createdStore = await collection.findOne({ _id: result.insertedId });
        
        if (createdStore) {
          return NextResponse.json(transformMongoDocument(createdStore), { status: 201 });
        }
      } catch (mongoError) {
        console.error('MongoDB error:', mongoError);
        // Fall back to mock data if MongoDB fails
      }
    }
    
    // Fallback: return mock response for development
    const newStore = {
      id: `store-${Date.now()}`,
      ...storeData,
      status: storeData.status || 'Operational',
      openingDate: storeData.openingDate || new Date().toISOString(),
      improvementPoints: storeData.improvementPoints || [],
      tasks: storeData.tasks || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(newStore, { status: 201 });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      { error: 'Failed to create store' },
      { status: 500 }
    );
  }
}