import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSubmit: (body: string, parentId?: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function CommentForm({
  parentId,
  onSubmit,
  onCancel,
  placeholder = 'What are your thoughts?',
  autoFocus = false,
}: CommentFormProps) {
  const { isAuthenticated } = useAuth();
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(body.trim(), parentId);
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <p className="text-reddit-muted text-sm py-2">
        <a href="/login" className="text-reddit-blue hover:underline">Log in</a> to comment.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={4}
        className="w-full bg-reddit-dark border border-reddit-border rounded p-3 text-reddit-text placeholder-reddit-muted text-sm resize-y focus:outline-none focus:border-blue-400"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-sm text-reddit-muted hover:text-reddit-text transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !body.trim()}
          className="px-4 py-1 bg-reddit-orange text-white rounded-full text-sm font-medium disabled:opacity-50 hover:bg-orange-600 transition-colors"
        >
          {isSubmitting ? 'Posting…' : 'Comment'}
        </button>
      </div>
    </form>
  );
}
