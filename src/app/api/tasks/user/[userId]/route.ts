// This file is deprecated and its contents have been moved to /api/users/[userId]/tasks-assigned/route.ts
// This file can be removed.
import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ error: 'This endpoint is deprecated. Please use /api/users/[userId]/tasks-assigned' }, { status: 404 });
}
