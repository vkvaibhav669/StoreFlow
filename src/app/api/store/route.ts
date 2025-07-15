import { NextResponse } from 'next/server';
import clientPromise, { transformMongoDocuments } from '@/lib/mongodb';
import { mockStores } from '@/lib/data';

export async function GET() {
  try {
    // Try to get stores from MongoDB first
    try {
      const client = await clientPromise;
      const db = client.db("storeflow");
      const collection = db.collection("stores");
      
      const stores = await collection.find({}).toArray();
      
      if (stores && stores.length > 0) {
        return NextResponse.json(transformMongoDocuments(stores));
      }
    } catch (mongoError) {
      console.error('MongoDB error:', mongoError);
      // Fall back to mock data if MongoDB fails
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