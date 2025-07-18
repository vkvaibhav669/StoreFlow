import { useState, useEffect, useCallback } from 'react';
import { getProjectComments, addProjectComment, getTaskComments, addTaskComment } from '@/lib/api';
import type { Comment } from '@/types';

export function useProjectComments(projectId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedComments = await getProjectComments(projectId);
      setComments(Array.isArray(fetchedComments) ? fetchedComments : []);
    } catch (err) {
      console.error('Error fetching project comments:', err);
      setError('Failed to fetch comments');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const addComment = useCallback(async (commentData: { author: string; text: string; authorId?: string }) => {
    if (!projectId) return;
    
    try {
      const newComment = await addProjectComment(projectId, commentData);
      // Refresh comments after adding
      await fetchComments();
      return newComment;
    } catch (err) {
      console.error('Error adding project comment:', err);
      setError('Failed to add comment');
      throw err;
    }
  }, [projectId, fetchComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (!projectId) return;
    
    const interval = setInterval(fetchComments, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [projectId, fetchComments]);

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