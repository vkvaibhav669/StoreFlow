import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromHeaders, verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Get token from authorization header
    const token = getTokenFromHeaders(request.headers);
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // In a more sophisticated implementation, you might want to:
    // 1. Add the token to a blacklist in the database
    // 2. Log the logout event
    // 3. Clear any server-side sessions
    
    // For now, we just return success since the client will delete the token
    return NextResponse.json({ 
      message: 'Logged out successfully' 
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}