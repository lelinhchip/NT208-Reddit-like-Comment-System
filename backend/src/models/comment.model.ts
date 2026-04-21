export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  /** ltree path, e.g. "root.abc123.def456" */
  path: string;
  body: string;
  upvotes: number;
  downvotes: number;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CommentWithAuthor extends Comment {
  author_username: string;
  author_avatar_url: string | null;
  children?: CommentWithAuthor[];
}

export interface CreateCommentDto {
  post_id: string;
  author_id: string;
  parent_id?: string;
  body: string;
}

export interface UpdateCommentDto {
  body: string;
}
