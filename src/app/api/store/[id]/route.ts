import { NextResponse } from 'next/server';
import { mockStores } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate the ID parameter
    if (!id || id.trim() === '' || id === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid store ID' },
        { status: 400 }
      );
    }

    // Check if MongoDB is configured
    if (process.env.MONGODB_URI) {
      try {
        // Dynamic import to avoid module load errors when MONGODB_URI is not set
        const { default: clientPromise, isValidObjectId, toObjectId, transformMongoDocument } = await import('@/lib/mongodb');
        
        if (isValidObjectId(id)) {
          const client = await clientPromise;
          const db = client.db("StoreFlow");
          const collection = db.collection("stores");
          
          const store = await collection.findOne({ _id: toObjectId(id) });
          
          if (store) {
            return NextResponse.json(transformMongoDocument(store));
          }
        }
      } catch (mongoError) {
        console.error('MongoDB error:', mongoError);
        // Fall back to mock data if MongoDB fails
      }
    }
    
    // Fall back to mock data for simple string IDs or if MongoDB fails
    const store = mockStores.find(store => store.id === id);
    
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store' },
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
    if (!id || id.trim() === '' || id === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid store ID' },
        { status: 400 }
      );
    }

    // Check if MongoDB is configured
    if (process.env.MONGODB_URI) {
      try {
        // Dynamic import to avoid module load errors when MONGODB_URI is not set
        const { default: clientPromise, isValidObjectId, toObjectId, transformMongoDocument } = await import('@/lib/mongodb');
        
        if (isValidObjectId(id)) {
          const client = await clientPromise;
          const db = client.db("StoreFlow");
          const collection = db.collection("stores");

          // Add updatedAt timestamp
          const updatePayload = {
            ...updateData,
            updatedAt: new Date()
          };

          // Update the store
          const result = await collection.findOneAndUpdate(
            { _id: toObjectId(id) },
            { $set: updatePayload },
            { returnDocument: 'after' }
          );

          if (result) {
            return NextResponse.json(transformMongoDocument(result));
          } else {
            return NextResponse.json(
              { error: 'Store not found' },
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
    const existingStore = mockStores.find(store => store.id === id);
    if (!existingStore) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    const updatedStore = {
      ...existingStore,
      ...updateData,
      id: id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json(
      { error: 'Failed to update store' },
      { status: 500 }
    );
  }
}