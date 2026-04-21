import { useState, useEffect, useCallback } from 'react';
import { Comment } from '../types';
import { commentService } from '../services/comment.service';

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tree = await commentService.getCommentTree(postId);
      setComments(tree);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (body: string, parentId?: string) => {
    const newComment = await commentService.createComment(postId, body, parentId);
    // Optimistic: re-fetch to get updated tree
    setComments((prev) => insertComment(prev, newComment, parentId));
    return newComment;
  };

  const editComment = async (id: string, body: string) => {
    const updated = await commentService.updateComment(id, body);
    setComments((prev) => replaceComment(prev, updated));
    return updated;
  };

  const removeComment = async (id: string) => {
    await commentService.deleteComment(id);
    setComments((prev) => removeCommentById(prev, id));
  };

  const vote = async (id: string, type: 'upvote' | 'downvote') => {
    const updated = await commentService.voteComment(id, type);
    setComments((prev) => replaceComment(prev, updated));
    return updated;
  };

  return { comments, isLoading, error, addComment, editComment, removeComment, vote, refetch: fetchComments };
}

// ── Tree helpers ────────────────────────────────────────────────────────────

function insertComment(
  tree: Comment[],
  comment: Comment,
  parentId?: string
): Comment[] {
  if (!parentId) return [...tree, comment];
  return tree.map((c) => {
    if (c.id === parentId) {
      return { ...c, children: [...(c.children ?? []), comment] };
    }
    if (c.children) {
      return { ...c, children: insertComment(c.children, comment, parentId) };
    }
    return c;
  });
}

function replaceComment(tree: Comment[], updated: Comment): Comment[] {
  return tree.map((c) => {
    if (c.id === updated.id) return { ...updated, children: c.children };
    if (c.children) return { ...c, children: replaceComment(c.children, updated) };
    return c;
  });
}

function removeCommentById(tree: Comment[], id: string): Comment[] {
  return tree
    .filter((c) => c.id !== id)
    .map((c) => ({
      ...c,
      children: c.children ? removeCommentById(c.children, id) : undefined,
    }));
}
