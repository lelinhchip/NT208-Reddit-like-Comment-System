import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-reddit-card border-b border-reddit-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
        <Link to="/" className="text-reddit-orange font-bold text-xl tracking-tight">
          💬 CommentHub
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {isAuthenticated ? (
            <>
              <span className="text-reddit-muted">u/{user?.username}</span>
              <button
                onClick={logout}
                className="px-3 py-1 border border-reddit-orange text-reddit-orange rounded-full hover:bg-reddit-orange hover:text-white transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1 border border-reddit-orange text-reddit-orange rounded-full hover:bg-reddit-orange hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1 bg-reddit-orange text-white rounded-full hover:bg-orange-600 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
