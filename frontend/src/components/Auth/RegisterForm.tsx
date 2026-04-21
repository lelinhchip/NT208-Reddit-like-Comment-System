import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-reddit-text text-center">Create Account</h1>

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-400 rounded p-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-reddit-muted text-xs uppercase tracking-wide">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={30}
          pattern="^\w+$"
          title="Letters, numbers and underscores only"
          className="bg-reddit-dark border border-reddit-border rounded p-3 text-reddit-text text-sm focus:outline-none focus:border-blue-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-reddit-muted text-xs uppercase tracking-wide">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-reddit-dark border border-reddit-border rounded p-3 text-reddit-text text-sm focus:outline-none focus:border-blue-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-reddit-muted text-xs uppercase tracking-wide">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="bg-reddit-dark border border-reddit-border rounded p-3 text-reddit-text text-sm focus:outline-none focus:border-blue-400"
        />
        <span className="text-reddit-muted text-xs">Minimum 8 characters</span>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-reddit-orange text-white rounded-full py-2 font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Creating account…' : 'Sign Up'}
      </button>

      <p className="text-center text-reddit-muted text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-reddit-blue hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
