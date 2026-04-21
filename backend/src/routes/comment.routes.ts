import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { commentRateLimiter } from '../middlewares/rateLimiter.middleware';
import { AuthenticatedRequest } from '../types';
import { Response } from 'express';

export const commentRouter = Router();

// Public: read comment tree for a post
commentRouter.get('/posts/:postId/comments', (req, res) =>
  commentController.getCommentTree(req as AuthenticatedRequest, res as Response)
);

// Public: read a single comment
commentRouter.get('/:id', (req, res) =>
  commentController.getComment(req as AuthenticatedRequest, res as Response)
);

// Protected: create, update, delete, vote
commentRouter.post(
  '/',
  authenticate,
  commentRateLimiter,
  (req, res) => commentController.createComment(req as AuthenticatedRequest, res as Response)
);

commentRouter.patch(
  '/:id',
  authenticate,
  commentRateLimiter,
  (req, res) => commentController.updateComment(req as AuthenticatedRequest, res as Response)
);

commentRouter.delete(
  '/:id',
  authenticate,
  (req, res) => commentController.deleteComment(req as AuthenticatedRequest, res as Response)
);

commentRouter.post(
  '/:id/vote',
  authenticate,
  commentRateLimiter,
  (req, res) => commentController.voteComment(req as AuthenticatedRequest, res as Response)
);
