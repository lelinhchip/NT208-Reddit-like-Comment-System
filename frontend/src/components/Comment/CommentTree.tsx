import { useComments } from '../../hooks/useComments';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentTreeProps {
  postId: string;
}

export default function CommentTree({ postId }: CommentTreeProps) {
  const { comments, isLoading, error, addComment, editComment, removeComment, vote } =
    useComments(postId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-reddit-muted text-sm">
        Loading comments…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm py-4">
        Error: {error}
      </div>
    );
  }

  return (
    <section aria-label="Comments">
      <h2 className="text-reddit-text font-semibold mb-4">
        {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </h2>

      {/* Top-level compose form */}
      <div className="mb-6 bg-reddit-card border border-reddit-border rounded p-4">
        <CommentForm
          postId={postId}
          onSubmit={addComment}
        />
      </div>

      {/* Comment list */}
      <div className="flex flex-col gap-1">
        {comments.length === 0 ? (
          <p className="text-reddit-muted text-sm text-center py-8">
            No comments yet. Be the first!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-reddit-card border border-reddit-border rounded p-4"
            >
              <CommentItem
                comment={comment}
                depth={0}
                onReply={addComment}
                onEdit={editComment}
                onDelete={removeComment}
                onVote={vote}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
