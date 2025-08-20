import { NextResponse } from 'next/server';
import { mockProjects } from '@/lib/data';
import type { Task } from '@/types';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  try {
    const { projectId, taskId } = await params;

    // Validate parameters
    if (!projectId || projectId.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    if (!taskId || taskId.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const taskData = body;

    // Validate that we have some data to update
    if (!taskData || Object.keys(taskData).length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }

    // Try MongoDB first if configured and ObjectId is valid
    if (process.env.MONGODB_URI) {
      try {
        // Dynamic import to avoid module load errors when MONGODB_URI is not set
        const { default: clientPromise, isValidObjectId, toObjectId } = await import('@/lib/mongodb');
        
        if (isValidObjectId(projectId)) {
          const client = await clientPromise;
          const db = client.db("StoreFlow");
          const collection = db.collection("projects");
          
          // Find the project
          const project = await collection.findOne({ _id: toObjectId(projectId) });
          
          if (project) {
            // Find the task in the project's tasks array
            const taskIndex = project.tasks?.findIndex((task: any) => task.id === taskId);
            
            if (taskIndex === -1 || taskIndex === undefined) {
              return NextResponse.json(
                { error: 'Task not found in project' },
                { status: 404 }
              );
            }

            // Prepare the updated task data
            const updatedTaskData = {
              ...project.tasks[taskIndex],
              ...taskData,
              updatedAt: new Date().toISOString()
            };

            // Update the specific task in the tasks array
            const updateQuery: any = {};
            Object.keys(taskData).forEach(key => {
              updateQuery[`tasks.${taskIndex}.${key}`] = taskData[key];
            });
            updateQuery[`tasks.${taskIndex}.updatedAt`] = new Date().toISOString();
            updateQuery.updatedAt = new Date().toISOString();

            const result = await collection.updateOne(
              { _id: toObjectId(projectId) },
              { $set: updateQuery }
            );

            if (result.modifiedCount > 0) {
              return NextResponse.json(updatedTaskData);
            } else {
              return NextResponse.json(
                { error: 'Failed to update task' },
                { status: 500 }
              );
            }
          }
        }
      } catch (mongoError) {
        console.error('MongoDB error:', mongoError);
        // Fall back to mock data if MongoDB fails
      }
    }
    
    // Fall back to mock data for simple string IDs or if MongoDB fails
    const projectIndex = mockProjects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      const project = mockProjects[projectIndex];
      const taskIndex = project.tasks?.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1 || taskIndex === undefined) {
        return NextResponse.json(
          { error: 'Task not found in project' },
          { status: 404 }
        );
      }

      // Update the task
      const updatedTask = {
        ...project.tasks[taskIndex],
        ...taskData,
        updatedAt: new Date().toISOString()
      };
      
      project.tasks[taskIndex] = updatedTask;

      // Update in department details if department changes
      if (project.departments) {
        // Remove from old department's task list if department changed
        const oldTask = project.tasks[taskIndex];
        if (taskData.department && taskData.department !== oldTask.department) {
          const oldDeptKey = oldTask.department.toLowerCase() as keyof typeof project.departments;
          if (project.departments[oldDeptKey]) {
            const deptDetails = project.departments[oldDeptKey] as any;
            if (deptDetails.tasks) {
              deptDetails.tasks = deptDetails.tasks.filter((dTask: Task) => dTask.id !== taskId);
            }
          }
        }
        
        // Add/Update in new department's task list
        const newDeptKey = (taskData.department || oldTask.department).toLowerCase() as keyof typeof project.departments;
        if (project.departments[newDeptKey]) {
          const deptDetails = project.departments[newDeptKey] as any;
          if (deptDetails.tasks) {
            const deptTaskIndex = deptDetails.tasks.findIndex((dTask: Task) => dTask.id === taskId);
            if (deptTaskIndex !== -1) {
              deptDetails.tasks[deptTaskIndex] = updatedTask;
            } else {
              deptDetails.tasks.push(updatedTask);
            }
          } else {
            deptDetails.tasks = [updatedTask];
          }
        } else {
          // Department might not exist yet if newly assigned
          if (newDeptKey === "marketing") {
            (project.departments as any)[newDeptKey] = { 
              tasks: [updatedTask], 
              preLaunchCampaigns: [], 
              postLaunchCampaigns: [] 
            };
          } else {
            (project.departments as any)[newDeptKey] = { tasks: [updatedTask] };
          }
        }
      }

      // Update project progress
      if (project.tasks) {
        project.currentProgress = Math.round(
          project.tasks.filter(t => t.status === 'Completed').length / project.tasks.length * 100
        );
      }

      return NextResponse.json(updatedTask);
    }

    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

    