'use server';

import {NextResponse} from 'next/server';
import {mockProjects} from '@/lib/data';
import type {Comment} from '@/types';
import {
  addCommentToProject,
  getProjectById,
  updateProject,
} from '@/lib/api';

export const dynamic = 'force-dynamic';

// This GET endpoint is no longer the primary way to fetch comments.
// They are now embedded in the main project object via /api/projects/[id].
// This can be kept for special cases or removed if no longer needed.
// For now, we will assume it's deprecated and functionality is in the main route.
export async function GET(
  request: Request,
  {params}: {params: {id: string}}
) {
  try {
    const {id} = params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({error: 'Project not found'}, {status: 404});
    }
    const comments = project.discussion || project.comments || [];
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching project comments:', error);
    return NextResponse.json(
      {error: 'Failed to fetch project comments'},
      {status: 500}
    );
  }
}

export async function POST(
  request: Request,
  {params}: {params: {id: string}}
) {
  try {
    const {id} = params;
    const body = await request.json();
    const {author, text, authorId} = body;

    if (!author || !text) {
      return NextResponse.json(
        {error: 'Author and text are required'},
        {status: 400}
      );
    }
    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({error: 'Project not found'}, {status: 404});
    }

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author,
      authorId,
      timestamp: new Date().toISOString(),
      text,
      replies: [],
    };

    const discussion = [...(project.discussion || []), newComment];
    await updateProject(id, {discussion});

    return NextResponse.json(newComment, {status: 201});
  } catch (error) {
    console.error('Error adding project comment:', error);
    return NextResponse.json(
      {error: 'Failed to add project comment'},
      {status: 500}
    );
  }
}
