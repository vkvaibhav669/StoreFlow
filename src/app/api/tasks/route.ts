import { NextResponse } from 'next/server';
import { mockProjects } from '@/lib/data';
import type { Task } from '@/types';

export async function GET() {
  try {
    // Extract all tasks from projects
    const allTasks: Task[] = [];
    
    mockProjects.forEach(project => {
      if (project.tasks && project.tasks.length > 0) {
        allTasks.push(...project.tasks);
      }
    });
    
    return NextResponse.json(allTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}