# NT208 – Reddit-like Comment System

A full-stack, university project implementing a Reddit-style nested comment system.

**Tech Stack:** React (Vite) · Tailwind CSS · TypeScript · Node.js · Express · PostgreSQL (ltree) · Redis · Docker

---

## Repository Structure

```
NT208-Reddit-like-Comment-System/
├── backend/                  ← Node.js + Express API
│   ├── src/
│   │   ├── app.ts            ← Express app factory
│   │   ├── server.ts         ← HTTP server bootstrap
│   │   ├── config/           ← DB & Redis clients
│   │   ├── routes/           ← URL routing
│   │   ├── controllers/      ← Request/response layer (Zod validation)
│   │   ├── services/         ← Business logic + Redis cache
│   │   ├── repositories/     ← SQL queries
│   │   ├── middlewares/      ← JWT auth, rate limiters
│   │   ├── models/           ← TypeScript interfaces
│   │   └── types/            ← Shared types
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md             ← Backend-specific docs
│
├── frontend/                 ← React (Vite) + Tailwind
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   │   ├── Comment/      ← CommentTree (recursive), CommentItem, CommentForm
│   │   │   ├── Auth/         ← LoginForm, RegisterForm
│   │   │   └── Layout/       ← Header, Layout
│   │   ├── hooks/            ← useAuth, useComments
│   │   ├── services/         ← API client, auth.service, comment.service
│   │   ├── pages/            ← HomePage, LoginPage, RegisterPage
│   │   └── types/            ← Shared TypeScript interfaces
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
│
├── docs/
│   ├── database_schema.sql   ← PostgreSQL + ltree schema
│   └── architecture.md       ← Architecture overview
│
├── docker-compose.yml        ← Spins up Postgres, Redis, backend, frontend
├── .gitignore
└── README.md                 ← This file
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Docker Desktop | latest |
| docker compose | v2+ |
| Node.js | ≥ 20 (for local dev without Docker) |
| npm | ≥ 10 |

---

## Quickstart – Full Stack with Docker

### 1. Clone the repo

```bash
git clone https://github.com/lelinhchip/NT208-Reddit-like-Comment-System.git
cd NT208-Reddit-like-Comment-System
```

### 2. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` with a strong `JWT_SECRET` value (any random string ≥ 32 chars).

### 3. Spin up all containers

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| Health check | http://localhost:4000/health |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

> The `database_schema.sql` is automatically applied by PostgreSQL on first start.

### 4. Stop containers

```bash
docker compose down
# To also remove volumes (wipes database):
docker compose down -v
```

---

## Local Development (without Docker)

### Backend

```bash
# Terminal 1 – start infrastructure only
docker compose up postgres redis -d

# Terminal 2 – run backend in dev mode (hot reload)
cd backend
cp .env.example .env   # adjust DB/Redis URLs to localhost
npm install
npm run dev
```

### Frontend

```bash
# Terminal 3
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend dev server: http://localhost:3000  
API requests proxied to http://localhost:4000 via Vite proxy config.

---

## API Overview

All API routes are prefixed with `/api`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login, receive JWT |
| GET | `/api/comments/posts/:postId/comments` | — | Get comment tree |
| POST | `/api/comments/` | Bearer JWT | Create comment |
| PATCH | `/api/comments/:id` | Bearer JWT | Edit comment |
| DELETE | `/api/comments/:id` | Bearer JWT | Delete comment |
| POST | `/api/comments/:id/vote` | Bearer JWT | Vote on comment |

See [backend/README.md](./backend/README.md) for full request/response examples.

---

## Git Branching Strategy

We follow **GitHub Flow** adapted for a 4-person team.

### Branch naming

| Prefix | Usage | Example |
|--------|-------|---------|
| `main` | Production-ready code | — |
| `develop` | Integration branch for all features | — |
| `feature/<ticket>-<short-desc>` | New features | `feature/42-comment-voting` |
| `fix/<ticket>-<short-desc>` | Bug fixes | `fix/17-jwt-expiry` |
| `chore/<short-desc>` | Tooling, CI, docs | `chore/update-docker-compose` |
| `hotfix/<short-desc>` | Urgent production fixes | `hotfix/xss-sanitize` |

### Workflow

```
main ──────────────────────────────────────────────────► (releases / tags)
  │
  └─► develop ──────────────────────────────────────────►
          │           │           │           │
          └─► feature  └─► fix     └─► chore   └─► feature
              (PR → develop when ready)
```

1. **Create a branch** from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/123-my-feature
   ```

2. **Commit** small, focused commits with descriptive messages:
   ```bash
   git commit -m "feat: add recursive comment rendering"
   git commit -m "fix: handle null parent_id in ltree path"
   ```

3. **Push and open a Pull Request** into `develop`:
   ```bash
   git push origin feature/123-my-feature
   # Open PR on GitHub → target branch: develop
   ```

4. **Code review**: At least **1 teammate** must approve before merging.

5. **Merge `develop` → `main`** after testing with a PR and tag a release:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

### Commit message convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

feat(comments): add nested reply support
fix(auth): prevent timing attack in login
chore(docker): pin postgres to 16-alpine
docs(readme): add branching guide
refactor(service): extract buildTree helper
test(repo): add comment repository unit tests
```

---

## Team Assignment

| Member | Responsibility |
|--------|---------------|
| Member 1 | Backend – Auth, User management |
| Member 2 | Backend – Comment CRUD, ltree queries, Redis cache |
| Member 3 | Frontend – Comment tree rendering, voting UI |
| Member 4 | Frontend – Auth pages, routing, API integration |

---

## Database Schema

See [`docs/database_schema.sql`](./docs/database_schema.sql) for the full PostgreSQL schema.

Key design decision – **Materialized Path with ltree**:
- Each comment stores its full ancestry as an `ltree` path (e.g., `root_id.parent_id.child_id`)
- Fetching an entire subtree: `WHERE path <@ $ancestorPath`
- Efficient GiST index on the `path` column

---

## License

MIT – for educational purposes (NT208, University of Information Technology, VNU-HCM)
