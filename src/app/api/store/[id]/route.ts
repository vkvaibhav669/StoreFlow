import { NextResponse } from 'next/server';
import type { StoreItem } from '@/types';

// Store data - in a real app, this would come from a database
const stores: StoreItem[] = [
  { 
    id: 'store-001', 
    name: 'Mumbai Phoenix Mall Flagship', 
    location: 'Lower Parel, Mumbai, Maharashtra', 
    type: 'COCO', 
    status: 'Under Construction', 
    openingDate: '2025-08-28', 
    manager: 'Priya Sharma', 
    sqft: 5000 
  },
  { 
    id: 'store-002', 
    name: 'Bangalore Orion Mall Outlet', 
    location: 'Rajajinagar, Bangalore, Karnataka', 
    type: 'COCO', 
    status: 'Operational', 
    openingDate: '2024-12-30', 
    manager: 'Rohan Mehra', 
    sqft: 3000, 
    dailySales: 85000, 
    customerSatisfaction: 4.5,
    improvementPoints: [
      {
        id: 'imp-001', 
        text: 'Improve queue management during peak hours.', 
        addedBy: 'Anita Desai', 
        addedAt: '2025-01-09T09:19:25.000Z', 
        userAvatar: 'https://placehold.co/40x40.png?text=AD', 
        comments: [], 
        isResolved: false
      },
    ], 
    tasks: [
      {
        id: 'stask-001', 
        storeId:'store-002', 
        title: 'Weekly Stock Audit', 
        assignedTo: 'Rohan Mehra', 
        status: 'Pending', 
        priority: 'Medium', 
        createdAt: '2025-01-12T09:19:25.000Z', 
        createdBy: 'Anita Desai', 
        dueDate: '2025-01-19'
      }
    ]
  },
  { 
    id: 'store-003', 
    name: 'Delhi Connaught Place Express', 
    location: 'Connaught Place, New Delhi, Delhi', 
    type: 'FOFO', 
    status: 'Planned', 
    openingDate: '2025-03-30', 
    sqft: 2500, 
    ownershipChangeRequested: false 
  },
  { 
    id: 'store-004', 
    name: 'Chennai Citi Centre Store', 
    location: 'Mylapore, Chennai, Tamil Nadu', 
    type: 'COCO', 
    status: 'Under Construction', 
    openingDate: '2025-02-03', 
    manager: 'Vikram Singh', 
    sqft: 2800 
  },
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    
    // Find the store by ID
    const store = stores.find(store => store.id === id);
    
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