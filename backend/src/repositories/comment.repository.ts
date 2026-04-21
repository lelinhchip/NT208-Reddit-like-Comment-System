import { pool } from '../config/database';
import {
  Comment,
  CommentWithAuthor,
  CreateCommentDto,
  UpdateCommentDto,
} from '../models/comment.model';

const COMMENT_WITH_AUTHOR_FIELDS = `
  c.id, c.post_id, c.author_id, c.parent_id, c.path::text,
  c.body, c.upvotes, c.downvotes, c.is_deleted, c.created_at, c.updated_at,
  u.username AS author_username, u.avatar_url AS author_avatar_url
`;

export class CommentRepository {
  /** Fetch all non-deleted comments for a post, ordered by ltree path */
  async findByPostId(postId: string): Promise<CommentWithAuthor[]> {
    const result = await pool.query<CommentWithAuthor>(
      `SELECT ${COMMENT_WITH_AUTHOR_FIELDS}
         FROM comments c
         JOIN users u ON u.id = c.author_id
        WHERE c.post_id = $1 AND c.is_deleted = FALSE
        ORDER BY c.path`,
      [postId]
    );
    return result.rows;
  }

  /** Fetch a single comment by id */
  async findById(id: string): Promise<CommentWithAuthor | null> {
    const result = await pool.query<CommentWithAuthor>(
      `SELECT ${COMMENT_WITH_AUTHOR_FIELDS}
         FROM comments c
         JOIN users u ON u.id = c.author_id
        WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  /** Fetch all descendants of a comment using ltree <@ operator */
  async findDescendants(commentId: string): Promise<CommentWithAuthor[]> {
    const result = await pool.query<CommentWithAuthor>(
      `SELECT ${COMMENT_WITH_AUTHOR_FIELDS}
         FROM comments c
         JOIN users u ON u.id = c.author_id
        WHERE c.path <@ (
                SELECT path FROM comments WHERE id = $1
              )
          AND c.id != $1
          AND c.is_deleted = FALSE
        ORDER BY c.path`,
      [commentId]
    );
    return result.rows;
  }

  /** Create a new top-level or nested comment */
  async create(dto: CreateCommentDto): Promise<Comment> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Determine the parent path (or use id as root segment)
      let parentPath: string | null = null;
      if (dto.parent_id) {
        const parent = await client.query<{ path: string }>(
          `SELECT path::text FROM comments WHERE id = $1`,
          [dto.parent_id]
        );
        if (!parent.rows[0]) throw new Error('Parent comment not found');
        parentPath = parent.rows[0].path;
      }

      const result = await client.query<Comment>(
        `INSERT INTO comments (post_id, author_id, parent_id, body)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
        [dto.post_id, dto.author_id, dto.parent_id ?? null, dto.body]
      );
      const comment = result.rows[0];

      // Build ltree path: parent_path.id (replace hyphens, ltree labels are alphanumeric+underscore)
      const safeId = comment.id.replace(/-/g, '_');
      const newPath = parentPath
        ? `${parentPath}.${safeId}`
        : safeId;

      await client.query(
        `UPDATE comments SET path = $1::ltree WHERE id = $2`,
        [newPath, comment.id]
      );
      comment.path = newPath;

      await client.query('COMMIT');
      return comment;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async update(id: string, dto: UpdateCommentDto): Promise<Comment | null> {
    const result = await pool.query<Comment>(
      `UPDATE comments SET body = $1, updated_at = NOW()
        WHERE id = $2 AND is_deleted = FALSE
        RETURNING *`,
      [dto.body, id]
    );
    return result.rows[0] ?? null;
  }

  /** Soft-delete a comment */
  async softDelete(id: string): Promise<boolean> {
    const result = await pool.query(
      `UPDATE comments SET is_deleted = TRUE, updated_at = NOW() WHERE id = $1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async vote(
    id: string,
    type: 'upvote' | 'downvote'
  ): Promise<Comment | null> {
    const columnMap: Record<'upvote' | 'downvote', string> = {
      upvote: 'upvotes',
      downvote: 'downvotes',
    };
    const column = columnMap[type];
    const result = await pool.query<Comment>(
      `UPDATE comments
          SET ${column === 'upvotes' ? 'upvotes = upvotes + 1' : 'downvotes = downvotes + 1'},
              updated_at = NOW()
        WHERE id = $1 AND is_deleted = FALSE
        RETURNING *`,
      [id]
    );
    return result.rows[0] ?? null;
  }
}

export const commentRepository = new CommentRepository();
