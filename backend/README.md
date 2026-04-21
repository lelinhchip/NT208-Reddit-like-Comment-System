# Backend – Reddit-like Comment System API

Node.js · Express · TypeScript · PostgreSQL (ltree) · Redis

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| npm | ≥ 10 |
| Docker & docker-compose | any recent version |

---

## Local Development (without Docker)

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your local PostgreSQL and Redis credentials
```

### 3. Start PostgreSQL & Redis via Docker

```bash
# From repository root
docker compose up postgres redis -d
```

### 4. Run database migrations

```bash
# Apply the schema (first time only)
psql "$DATABASE_URL" -f ../docs/database_schema.sql
```

### 5. Start the development server

```bash
npm run dev
```

The API will be available at **http://localhost:4000**.

---

## API Endpoints

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | Server health check |

### Authentication (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | None | Register a new user |
| POST | `/api/auth/login` | None | Login and receive JWT |

**Register request body:**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "mypassword123"
}
```

**Login request body:**
```json
{
  "email": "alice@example.com",
  "password": "mypassword123"
}
```

**Response (both):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "username": "alice", "email": "alice@example.com" },
    "token": "<JWT>"
  }
}
```

### Comments (`/api/comments`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/comments/posts/:postId/comments` | None | Get comment tree for a post |
| GET | `/api/comments/:id` | None | Get a single comment |
| POST | `/api/comments/` | Bearer JWT | Create a comment |
| PATCH | `/api/comments/:id` | Bearer JWT | Edit own comment |
| DELETE | `/api/comments/:id` | Bearer JWT | Soft-delete own comment |
| POST | `/api/comments/:id/vote` | Bearer JWT | Upvote or downvote |

**Create comment body:**
```json
{
  "post_id": "<uuid>",
  "parent_id": "<uuid | omit for top-level>",
  "body": "This is my comment"
}
```

**Vote body:**
```json
{ "type": "upvote" }
```

All protected routes require `Authorization: Bearer <token>` header.

---

## Architecture

```
src/
├── app.ts             ← Express app factory (middleware stack)
├── server.ts          ← HTTP server bootstrap & graceful shutdown
├── config/
│   ├── database.ts    ← pg Pool singleton
│   └── redis.ts       ← ioredis singleton
├── routes/            ← Thin routers – wire URLs to controllers
├── controllers/       ← Request/response parsing & validation (Zod)
├── services/          ← Business logic (auth, comment tree, caching)
├── repositories/      ← SQL queries (pg Pool)
├── middlewares/       ← JWT auth, rate limiters
├── models/            ← TypeScript interfaces (User, Comment)
└── types/             ← Shared types (AuthenticatedRequest, ApiResponse)
```

Data flow: **Route → Controller → Service → Repository → Database/Cache**

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot-reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
