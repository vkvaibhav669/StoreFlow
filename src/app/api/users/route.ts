
import { NextResponse } from 'next/server';
import { getAllMockUsers } from '@/lib/auth';
import type { User } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allUsers = getAllMockUsers();
    
    // We should not expose sensitive data, even in a mock environment.
    // The User type doesn't include password, so we map to ensure consistency.
    const safeUserData: Omit<User, 'password'>[] = allUsers.map(({ id, name, email, role }) => ({
      id,
      name,
      email,
      role,
    }));
    
    return NextResponse.json(safeUserData);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
