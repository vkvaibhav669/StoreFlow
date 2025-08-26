
import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
import type { User, Department, UserRole } from '@/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, role, department, password } = body;

        if (!name || !email || !role || !password) {
            return NextResponse.json({ message: 'Missing required fields: name, email, role, and password are required.' }, { status: 400 });
        }

        const newUser = await registerUser({
            name,
            email,
            role: role as UserRole,
            department: department as Department | undefined,
            password
        });
        
        // Do not return the password in the response
        const { ...safeUser } = newUser;

        return NextResponse.json(safeUser, { status: 201 });
    } catch (error) {
        if ((error as Error).message.includes('already exists')) {
             return NextResponse.json({ message: (error as Error).message }, { status: 409 });
        }
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
