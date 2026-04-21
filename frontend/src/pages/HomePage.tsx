import CommentTree from '../components/Comment/CommentTree';

// Demo post ID – replace with real routing / post fetching
const DEMO_POST_ID = '00000000-0000-0000-0000-000000000001';

export default function HomePage() {
  return (
    <div>
      <div className="bg-reddit-card border border-reddit-border rounded p-6 mb-6">
        <h1 className="text-xl font-bold text-reddit-text mb-2">
          Welcome to CommentHub 💬
        </h1>
        <p className="text-reddit-muted text-sm">
          A Reddit-style nested comment system built with React, Node.js,
          PostgreSQL (ltree) and Redis.
        </p>
      </div>

      <CommentTree postId={DEMO_POST_ID} />
    </div>
  );
}
