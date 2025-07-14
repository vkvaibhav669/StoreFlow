import { NextResponse } from 'next/server';
import { mockStores } from '@/lib/data';

export async function GET() {
  try {
    // Return the stores data from the existing mock data
    return NextResponse.json(mockStores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}