import { useState, useEffect, useCallback } from 'react';
import { addProjectComment, getTaskComments, addTaskComment } from '@/lib/api';
import type { Comment } from '@/types';

// This hook is deprecated as project comments are now fetched with the project document.
// Keeping it here temporarily to avoid breaking changes, but it should be removed.
export function useProjectComments(projectId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    // This function is now a no-op, as comments are part of the project object.
  }, [projectId]);

  const addComment = useCallback(async (commentData: { author: string; text: string; authorId?: string }) => {
    if (!projectId) return;
    
    try {
      const newComment = await addProjectComment(projectId, commentData);
      // The calling component is now responsible for refetching the entire project.
      return newComment;
    } catch (err) {
      console.error('Error adding project comment:', err);
      setError('Failed to add comment');
      throw err;
    }
  }, [projectId]);

  useEffect(() => {
    // No initial fetch.
  }, [fetchComments]);

  return {
    comments,
    isLoading,
    error,
    addComment,
    refetch: fetchComments
  };
}

export function useTaskComments(taskId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!taskId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedComments = await getTaskComments(taskId);
      setComments(Array.isArray(fetchedComments) ? fetchedComments : []);
    } catch (err) {
      console.error('Error fetching task comments:', err);
      setError('Failed to fetch comments');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  const addComment = useCallback(async (commentData: { author: string; text: string; authorId?: string }) => {
    if (!taskId) return;
    
    try {
      const newComment = await addTaskComment(taskId, commentData);
      // Refresh comments after adding
      await fetchComments();
      return newComment;
    } catch (err) {
      console.error('Error adding task comment:', err);
      setError('Failed to add comment');
      throw err;
    }
  }, [taskId, fetchComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (!taskId) return;
    
    const interval = setInterval(fetchComments, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [taskId, fetchComments]);

  return {
    comments,
    isLoading,
    error,
    addComment,
    refetch: fetchComments
  };
}
