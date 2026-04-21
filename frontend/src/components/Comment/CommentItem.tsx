import { useState } from 'react';
import { Comment } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  onReply: (body: string, parentId?: string) => Promise<void>;
  onEdit: (id: string, body: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onVote: (id: string, type: 'upvote' | 'downvote') => Promise<void>;
}

const MAX_DEPTH = 8;

export default function CommentItem({
  comment,
  depth = 0,
  onReply,
  onEdit,
  onDelete,
  onVote,
}: CommentItemProps) {
  const { user, isAuthenticated } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [replyBody, setReplyBody] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isOwner = user?.id === comment.author_id;
  const score = comment.upvotes - comment.downvotes;

  const INDENT_CLASSES: Record<number, string> = {
    0: '',
    1: 'ml-4',
    2: 'ml-8',
    3: 'ml-12',
    4: 'ml-16',
  };
  const indentClass = INDENT_CLASSES[Math.min(depth, MAX_DEPTH)] ?? 'ml-16';

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    await onReply(replyBody.trim(), comment.id);
    setReplyBody('');
    setShowReplyForm(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBody.trim()) return;
    await onEdit(comment.id, editBody.trim());
    setIsEditing(false);
  };

  return (
    <div className={`${indentClass} ${depth > 0 ? 'border-l-2 border-reddit-border pl-3' : ''} mt-3`}>
      {/* Comment header */}
      <div className="flex items-center gap-2 text-xs text-reddit-muted mb-1">
        <span className="font-medium text-reddit-text">u/{comment.author_username}</span>
        <span>·</span>
        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
      </div>

      {/* Body or edit form */}
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={3}
            className="w-full bg-reddit-dark border border-reddit-border rounded p-2 text-sm text-reddit-text resize-y focus:outline-none focus:border-blue-400"
          />
          <div className="flex gap-2">
            <button type="submit" className="text-xs px-3 py-1 bg-reddit-orange text-white rounded-full">
              Save
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="text-xs px-3 py-1 text-reddit-muted">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-reddit-text whitespace-pre-wrap leading-relaxed">
          {comment.is_deleted ? (
            <em className="text-reddit-muted">[deleted]</em>
          ) : (
            comment.body
          )}
        </p>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-3 mt-2 text-xs text-reddit-muted">
        {/* Votes */}
        <button
          onClick={() => onVote(comment.id, 'upvote')}
          className="hover:text-reddit-orange transition-colors"
          aria-label="Upvote"
        >
          ▲
        </button>
        <span className={score > 0 ? 'text-reddit-orange' : score < 0 ? 'text-blue-400' : ''}>
          {score}
        </span>
        <button
          onClick={() => onVote(comment.id, 'downvote')}
          className="hover:text-blue-400 transition-colors"
          aria-label="Downvote"
        >
          ▼
        </button>

        {/* Reply */}
        {isAuthenticated && !comment.is_deleted && (
          <button
            onClick={() => setShowReplyForm((v) => !v)}
            className="hover:text-reddit-text transition-colors"
          >
            Reply
          </button>
        )}

        {/* Owner actions */}
        {isOwner && !comment.is_deleted && (
          <>
            <button onClick={() => setIsEditing(true)} className="hover:text-reddit-text transition-colors">
              Edit
            </button>
            <button onClick={() => onDelete(comment.id)} className="hover:text-red-400 transition-colors">
              Delete
            </button>
          </>
        )}

        {/* Collapse */}
        {(comment.children?.length ?? 0) > 0 && (
          <button onClick={() => setIsCollapsed((v) => !v)} className="hover:text-reddit-text transition-colors">
            {isCollapsed ? '[+]' : '[–]'}
          </button>
        )}
      </div>

      {/* Inline reply form */}
      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="mt-2 flex flex-col gap-2">
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder={`Reply to u/${comment.author_username}…`}
            rows={3}
            autoFocus
            className="w-full bg-reddit-dark border border-reddit-border rounded p-2 text-sm text-reddit-text resize-y focus:outline-none focus:border-blue-400"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={!replyBody.trim()} className="text-xs px-3 py-1 bg-reddit-orange text-white rounded-full disabled:opacity-50">
              Reply
            </button>
            <button type="button" onClick={() => setShowReplyForm(false)} className="text-xs px-3 py-1 text-reddit-muted">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Recursive children */}
      {!isCollapsed && comment.children && comment.children.length > 0 && (
        <div>
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              depth={depth + 1}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </div>
  );
}
