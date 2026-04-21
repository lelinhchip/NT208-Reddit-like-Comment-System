-- ============================================================
-- NT208 Reddit-like Comment System – Database Schema
-- PostgreSQL with ltree extension (Materialized Path)
-- ============================================================

-- Enable the ltree extension for materialized path tree support
CREATE EXTENSION IF NOT EXISTS ltree;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- USERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    username      VARCHAR(30) UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url    TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email    ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

-- ────────────────────────────────────────────────────────────
-- POSTS  (minimal – needed as foreign key target for comments)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id  UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title      VARCHAR(300) NOT NULL,
    body       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts (author_id);

-- ────────────────────────────────────────────────────────────
-- COMMENTS  (Materialized Path via ltree)
--
-- The `path` column stores the ancestry chain of comment IDs
-- using ltree label syntax, e.g.:
--
--   Top-level comment  → path = 'aabbccdd_...'          (just its own id)
--   Reply to above     → path = 'aabbccdd_.../eeff1122_...'
--   Reply to reply     → path = 'aabbccdd_.../eeff1122_.../99887766_...'
--
-- UUID hyphens are replaced with underscores to satisfy ltree
-- label constraints (only [A-Za-z0-9_]).
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id    UUID        NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    author_id  UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    parent_id  UUID                 REFERENCES comments (id) ON DELETE SET NULL,
    path       LTREE       NOT NULL DEFAULT ''::ltree,
    body       TEXT        NOT NULL,
    upvotes    INTEGER     NOT NULL DEFAULT 0 CHECK (upvotes >= 0),
    downvotes  INTEGER     NOT NULL DEFAULT 0 CHECK (downvotes >= 0),
    is_deleted BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GiST index for fast ltree ancestor/descendant queries (<@, @>, ~, ?)
CREATE INDEX IF NOT EXISTS idx_comments_path      ON comments USING GIST (path);
-- BTree index for exact path matches and ordering
CREATE INDEX IF NOT EXISTS idx_comments_path_btree ON comments USING BTREE (path);
CREATE INDEX IF NOT EXISTS idx_comments_post_id    ON comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id  ON comments (parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id  ON comments (author_id);

-- ────────────────────────────────────────────────────────────
-- VOTES  (prevent duplicate votes per user per comment)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comment_votes (
    user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    comment_id UUID        NOT NULL REFERENCES comments (id) ON DELETE CASCADE,
    vote_type  VARCHAR(8)  NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, comment_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_votes_comment_id ON comment_votes (comment_id);

-- ────────────────────────────────────────────────────────────
-- HELPER FUNCTION – auto-update updated_at
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_updated_at_users
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_posts
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_comments
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ────────────────────────────────────────────────────────────
-- EXAMPLE QUERIES using ltree
-- ────────────────────────────────────────────────────────────

-- 1. Get all descendants of a comment (entire sub-thread):
--    SELECT * FROM comments
--     WHERE path <@ (SELECT path FROM comments WHERE id = '<comment_id>')
--       AND id != '<comment_id>';

-- 2. Get only direct children:
--    SELECT * FROM comments WHERE parent_id = '<comment_id>';

-- 3. Get depth of a comment (number of ancestors):
--    SELECT nlevel(path) - 1 AS depth FROM comments WHERE id = '<comment_id>';

-- 4. Get all top-level comments for a post:
--    SELECT * FROM comments
--     WHERE post_id = '<post_id>' AND parent_id IS NULL AND is_deleted = FALSE
--     ORDER BY upvotes DESC;

-- 5. Get the full thread for a post ordered by tree path (for rendering):
--    SELECT * FROM comments
--     WHERE post_id = '<post_id>' AND is_deleted = FALSE
--     ORDER BY path;
