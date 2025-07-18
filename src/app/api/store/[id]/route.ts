import { NextResponse } from 'next/server';
import clientPromise, { isValidObjectId, toObjectId, transformMongoDocument } from '@/lib/mongodb';
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

    // Try MongoDB first if ObjectId is valid
    if (isValidObjectId(id)) {
      try {
        const client = await clientPromise;
        const db = client.db("storeflow");
        const collection = db.collection("stores");
        
        const store = await collection.findOne({ _id: toObjectId(id) });
        
        if (store) {
          return NextResponse.json(transformMongoDocument(store));
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