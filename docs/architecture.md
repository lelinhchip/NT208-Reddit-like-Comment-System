# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Browser                                   │
│                    React + Vite + Tailwind CSS                        │
│  ┌──────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │  Pages   │  │    Components     │  │        Hooks             │   │
│  │ HomePage │  │  CommentTree      │  │  useComments (tree mgmt) │   │
│  │ Login    │  │  CommentItem      │  │  useAuth (JWT state)     │   │
│  │ Register │  │  (recursive)      │  │                          │   │
│  └──────────┘  └──────────────────┘  └──────────────────────────┘   │
│                         │ axios                                        │
└─────────────────────────┼───────────────────────────────────────────┘
                          │ HTTP/JSON (REST API)
┌─────────────────────────┼───────────────────────────────────────────┐
│                     Express API Server                               │
│   Routes → Controllers → Services → Repositories                     │
│                                                                       │
│  ┌──────────────┐  ┌─────────────────────────────────────────────┐  │
│  │ Middlewares  │  │              Services                        │  │
│  │  JWT auth    │  │  AuthService   → bcrypt hash, JWT sign       │  │
│  │  Rate limit  │  │  CommentService → build tree, Redis cache    │  │
│  └──────────────┘  └─────────────────────────────────────────────┘  │
│                          │               │                            │
└─────────────────────────┼───────────────┼────────────────────────────┘
                          │               │
              ┌───────────▼───┐   ┌───────▼──────────┐
              │  PostgreSQL   │   │      Redis        │
              │  (ltree ext)  │   │  (comment cache) │
              │               │   │  TTL = 60 s       │
              │ users         │   └──────────────────┘
              │ posts         │
              │ comments      │
              │  └─ path LTREE│
              │ comment_votes │
              └───────────────┘
```

## Data Model – Materialized Path (ltree)

Comments are stored as a flat table. The tree structure is encoded in
the `path` column using PostgreSQL's `ltree` extension.

### Example

```
Post #1 comments:
  Comment A (id: aaaa)  → path: "aaaa"
    Comment B (id: bbbb) → path: "aaaa.bbbb"
      Comment C (id: cccc) → path: "aaaa.bbbb.cccc"
    Comment D (id: dddd) → path: "aaaa.dddd"
  Comment E (id: eeee)  → path: "eeee"
```

### Key ltree Queries

```sql
-- All descendants of comment A:
SELECT * FROM comments WHERE path <@ 'aaaa' AND id != 'aaaa';

-- Depth of a comment (0 = root):
SELECT nlevel(path) - 1 AS depth FROM comments WHERE id = '<id>';

-- Order for UI rendering (parent-first, DFS):
SELECT * FROM comments WHERE post_id = '<id>' ORDER BY path;
```

## Caching Strategy

```
GET /api/comments/posts/:postId/comments
  │
  ├─► Redis GET "post:<postId>:comments"
  │     ├─► HIT  → return cached tree JSON (TTL 60 s)
  │     └─► MISS → query PostgreSQL, build tree, SET in Redis
  │
  └─► On write (create/update/delete/vote):
        DEL "post:<postId>:comments"
```

## Security

| Concern | Mitigation |
|---------|-----------|
| Authentication | JWT (HS256), 7-day expiry |
| Password storage | bcrypt, 12 salt rounds |
| SQL injection | Parameterised queries (pg pool) |
| XSS | React auto-escapes JSX |
| Rate limiting | express-rate-limit per IP |
| CORS | Whitelist only frontend origin |
| Helmet | Sets secure HTTP headers |
