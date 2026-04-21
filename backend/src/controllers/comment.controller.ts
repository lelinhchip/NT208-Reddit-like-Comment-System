import { Response } from 'express';
import { z } from 'zod';
import { commentService } from '../services/comment.service';
import { AuthenticatedRequest } from '../types';

const createSchema = z.object({
  post_id: z.string().uuid(),
  parent_id: z.string().uuid().optional(),
  body: z.string().min(1).max(10_000),
});

const updateSchema = z.object({
  body: z.string().min(1).max(10_000),
});

export class CommentController {
  async getCommentTree(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { postId } = req.params;
    try {
      const tree = await commentService.getCommentTree(postId);
      res.status(200).json({ success: true, data: tree });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch comments';
      res.status(500).json({ success: false, message });
    }
  }

  async getComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const comment = await commentService.getComment(id);
      res.status(200).json({ success: true, data: comment });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Comment not found';
      res.status(404).json({ success: false, message });
    }
  }

  async createComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        errors: parsed.error.errors.map((e) => e.message),
      });
      return;
    }

    try {
      const comment = await commentService.createComment({
        ...parsed.data,
        author_id: req.user!.id,
      });
      res.status(201).json({ success: true, data: comment });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create comment';
      res.status(400).json({ success: false, message });
    }
  }

  async updateComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        errors: parsed.error.errors.map((e) => e.message),
      });
      return;
    }

    try {
      const comment = await commentService.updateComment(
        id,
        req.user!.id,
        parsed.data
      );
      res.status(200).json({ success: true, data: comment });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update comment';
      const status = message === 'Forbidden' ? 403 : message === 'Comment not found' ? 404 : 400;
      res.status(status).json({ success: false, message });
    }
  }

  async deleteComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      await commentService.deleteComment(id, req.user!.id);
      res.status(204).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete comment';
      const status = message === 'Forbidden' ? 403 : message === 'Comment not found' ? 404 : 400;
      res.status(status).json({ success: false, message });
    }
  }

  async voteComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const type = req.body.type as 'upvote' | 'downvote';
    if (type !== 'upvote' && type !== 'downvote') {
      res.status(400).json({ success: false, message: 'type must be upvote or downvote' });
      return;
    }
    try {
      const comment = await commentService.voteComment(id, type);
      res.status(200).json({ success: true, data: comment });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to vote';
      res.status(404).json({ success: false, message });
    }
  }
}

export const commentController = new CommentController();
