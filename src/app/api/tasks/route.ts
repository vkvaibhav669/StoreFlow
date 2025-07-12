import { NextResponse } from 'next/server';
import { mockProjects } from '@/lib/data';

export async function GET() {
  try {
    // Return the projects data from the existing mock data
    return NextResponse.json(mockProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}