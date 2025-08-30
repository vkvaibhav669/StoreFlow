
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type { Note, User } from '@/types';
import { getAllMockUsers } from '@/lib/auth';

// In-memory mock database for notes
let mockNotes: Note[] = [
    // Pre-populate with some data for demonstration
    {
        id: 'note-1',
        content: 'This is a public note that everyone can see. It could be for general announcements.',
        authorId: 'user-001',
        authorName: 'Priya Sharma',
        authorEmail: 'priya.sharma@example.com',
        privacy: 'public',
        sharedWith: [],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
        id: 'note-2',
        content: 'This is a private note for Rohan Mehra. Only he should be able to see this.',
        authorId: 'user-002',
        authorName: 'Rohan Mehra',
        authorEmail: 'rohan.mehra@example.com',
        privacy: 'private',
        sharedWith: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 'note-3',
        content: 'This is a shared note between Priya and Rohan for a specific discussion.',
        authorId: 'user-001',
        authorName: 'Priya Sharma',
        authorEmail: 'priya.sharma@example.com',
        privacy: 'shared',
        sharedWith: [
            { userId: 'user-002', userName: 'Rohan Mehra', email: 'rohan.mehra@example.com' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

// Helper to get the current user from headers (for mock purposes)
// In a real app, this would use a session/token verification library
function getMockCurrentUser(): User | null {
    const headersList = headers();
    const userEmail = headersList.get('x-user-email');
    if (!userEmail) return null;
    const allUsers = getAllMockUsers();
    return allUsers.find(u => u.email === userEmail) || null;
}


export async function GET(request: Request) {
  const currentUser = getMockCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Filter notes based on the current user's permissions
  const visibleNotes = mockNotes.filter(note => {
    if (note.privacy === 'public') {
      return true; // Everyone can see public notes
    }
    if (note.authorId === currentUser.id) {
      return true; // Users can always see their own notes
    }
    if (note.privacy === 'shared' && note.sharedWith.some(u => u.userId === currentUser.id)) {
      return true; // User is in the shared list
    }
    return false;
  });

  return NextResponse.json(visibleNotes.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
}

export async function POST(request: Request) {
  const currentUser = getMockCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content, privacy, sharedWith } = body;

    if (!content || !privacy) {
      return NextResponse.json({ error: 'Content and privacy are required' }, { status: 400 });
    }

    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      content,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorEmail: currentUser.email,
      privacy,
      sharedWith: privacy === 'shared' ? sharedWith || [] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockNotes.unshift(newNote); // Add to the beginning of the array

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    const currentUser = getMockCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, content, privacy, sharedWith } = body;

        if (!id || !content || !privacy) {
            return NextResponse.json({ error: 'ID, content, and privacy are required' }, { status: 400 });
        }

        const noteIndex = mockNotes.findIndex(n => n.id === id);

        if (noteIndex === -1) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }

        const noteToUpdate = mockNotes[noteIndex];

        if (noteToUpdate.authorId !== currentUser.id) {
            return NextResponse.json({ error: 'Permission denied. You can only edit your own notes.' }, { status: 403 });
        }

        noteToUpdate.content = content;
        noteToUpdate.privacy = privacy;
        noteToUpdate.sharedWith = privacy === 'shared' ? sharedWith || [] : [];
        noteToUpdate.updatedAt = new Date().toISOString();

        mockNotes[noteIndex] = noteToUpdate;

        return NextResponse.json(noteToUpdate, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }
}


export async function DELETE(request: Request) {
    const currentUser = getMockCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const noteId = searchParams.get('id');

        if (!noteId) {
            return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
        }

        const noteIndex = mockNotes.findIndex(n => n.id === noteId);

        if (noteIndex === -1) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }

        const noteToDelete = mockNotes[noteIndex];

        // Only the author or an Admin/SuperAdmin can delete a note
        if (noteToDelete.authorId !== currentUser.id && currentUser.role === 'Member') {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        mockNotes.splice(noteIndex, 1);

        return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }
}
