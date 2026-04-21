import api from './api';
import { ApiResponse, Comment } from '../types';

export const commentService = {
  async getCommentTree(postId: string): Promise<Comment[]> {
    const { data } = await api.get<ApiResponse<Comment[]>>(
      `/comments/posts/${postId}/comments`
    );
    if (!data.success) throw new Error(data.message ?? 'Failed to fetch comments');
    return data.data ?? [];
  },

  async createComment(
    postId: string,
    body: string,
    parentId?: string
  ): Promise<Comment> {
    const { data } = await api.post<ApiResponse<Comment>>('/comments', {
      post_id: postId,
      body,
      ...(parentId ? { parent_id: parentId } : {}),
    });
    if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to create comment');
    return data.data;
  },

  async updateComment(id: string, body: string): Promise<Comment> {
    const { data } = await api.patch<ApiResponse<Comment>>(`/comments/${id}`, {
      body,
    });
    if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to update comment');
    return data.data;
  },

  async deleteComment(id: string): Promise<void> {
    await api.delete(`/comments/${id}`);
  },

  async voteComment(id: string, type: 'upvote' | 'downvote'): Promise<Comment> {
    const { data } = await api.post<ApiResponse<Comment>>(
      `/comments/${id}/vote`,
      { type }
    );
    if (!data.success || !data.data) throw new Error(data.message ?? 'Failed to vote');
    return data.data;
  },
};
