import { redis } from '../config/redis';
import { commentRepository } from '../repositories/comment.repository';
import {
  CommentWithAuthor,
  CreateCommentDto,
  UpdateCommentDto,
} from '../models/comment.model';

const CACHE_TTL = 60; // seconds

function buildTree(flat: CommentWithAuthor[]): CommentWithAuthor[] {
  const map = new Map<string, CommentWithAuthor>();
  const roots: CommentWithAuthor[] = [];

  for (const c of flat) {
    map.set(c.id, { ...c, children: [] });
  }

  for (const c of map.values()) {
    if (c.parent_id) {
      const parent = map.get(c.parent_id);
      if (parent) {
        parent.children!.push(c);
      } else {
        roots.push(c);
      }
    } else {
      roots.push(c);
    }
  }

  return roots;
}

export class CommentService {
  async getCommentTree(postId: string): Promise<CommentWithAuthor[]> {
    const cacheKey = `post:${postId}:comments`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as CommentWithAuthor[];
    }

    const flat = await commentRepository.findByPostId(postId);
    const tree = buildTree(flat);

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(tree));
    return tree;
  }

  async getComment(id: string): Promise<CommentWithAuthor> {
    const comment = await commentRepository.findById(id);
    if (!comment) throw new Error('Comment not found');
    return comment;
  }

  async createComment(dto: CreateCommentDto): Promise<CommentWithAuthor> {
    const comment = await commentRepository.create(dto);
    await this.invalidatePostCache(dto.post_id);
    const full = await commentRepository.findById(comment.id);
    if (!full) throw new Error('Failed to retrieve created comment');
    return full;
  }

  async updateComment(
    id: string,
    authorId: string,
    dto: UpdateCommentDto
  ): Promise<CommentWithAuthor> {
    const existing = await commentRepository.findById(id);
    if (!existing) throw new Error('Comment not found');
    if (existing.author_id !== authorId) throw new Error('Forbidden');

    const updated = await commentRepository.update(id, dto);
    if (!updated) throw new Error('Update failed');

    await this.invalidatePostCache(updated.post_id);

    const full = await commentRepository.findById(updated.id);
    if (!full) throw new Error('Failed to retrieve updated comment');
    return full;
  }

  async deleteComment(id: string, authorId: string): Promise<void> {
    const existing = await commentRepository.findById(id);
    if (!existing) throw new Error('Comment not found');
    if (existing.author_id !== authorId) throw new Error('Forbidden');

    await commentRepository.softDelete(id);
    await this.invalidatePostCache(existing.post_id);
  }

  async voteComment(
    id: string,
    type: 'upvote' | 'downvote'
  ): Promise<CommentWithAuthor> {
    const updated = await commentRepository.vote(id, type);
    if (!updated) throw new Error('Comment not found');

    await this.invalidatePostCache(updated.post_id);

    const full = await commentRepository.findById(updated.id);
    if (!full) throw new Error('Failed to retrieve voted comment');
    return full;
  }

  private async invalidatePostCache(postId: string): Promise<void> {
    await redis.del(`post:${postId}:comments`);
  }
}

export const commentService = new CommentService();
