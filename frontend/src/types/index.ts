export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  path: string;
  body: string;
  upvotes: number;
  downvotes: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  author_username: string;
  author_avatar_url: string | null;
  children?: Comment[];
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  body: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface AuthData {
  user: User;
  token: string;
}
