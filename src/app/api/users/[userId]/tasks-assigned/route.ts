
import { NextResponse } from 'next/server';
import { mockProjects } from '@/lib/data';
import type { Task, UserTask } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = decodeURIComponent(params.userId);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const allUserTasks: UserTask[] = [];

    // In a real app, this would be a MongoDB query.
    // We would query the 'projects' collection for documents where 'tasks.assignedTo' matches the userId.
    // For mock data, we iterate through projects and their tasks.
    mockProjects.forEach(project => {
      if (project.tasks && project.tasks.length > 0) {
        project.tasks.forEach(task => {
          // Check against assignedTo (email) or assignedToName for flexibility
          if (task.assignedTo === userId || task.assignedToName === userId || task.assignedToId === userId) {
            allUserTasks.push({
              ...task,
              projectId: project.id,
              projectName: project.name,
            });
          }
        });
      }
    });

    return NextResponse.json(allUserTasks);
  } catch (error) {
    console.error('Error fetching tasks for user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user tasks' },
      { status: 500 }
    );
  }
}
