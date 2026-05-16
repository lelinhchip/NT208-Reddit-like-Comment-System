import { useState } from 'react';
import { deleteComment, voteComment } from '../api/commentApi';
import CommentForm from './CommentForm';

const CommentItem = ({ comment, postId, onReply, onDelete, depth = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [currentVote, setCurrentVote] = useState(comment.user_vote || null);
  const [voteCount, setVoteCount] = useState(comment.vote_count || 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const maxDepth = 5;

  // Xử lý vote (upvote/downvote)
  const handleVote = async (voteType) => {
    try {
      // Nếu đã vote cùng loại => cancel vote (vote 0)
      const newVoteType = currentVote === voteType ? 0 : voteType;
      const response = await voteComment(comment.id, newVoteType);
      
      setCurrentVote(newVoteType);
      setVoteCount(response.vote_count);
    } catch (error) {
      console.error('Lỗi vote:', error);
      alert(error.message || 'Không thể vote bình luận');
    }
  };

  // Xử lý xóa bình luận
  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return;
    
    setIsDeleting(true);
    try {
      await deleteComment(comment.id);
      if (onDelete) onDelete(comment.id);
    } catch (error) {
      console.error('Lỗi xóa:', error);
      alert(error.message || 'Không thể xóa bình luận');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      style={{ 
        marginLeft: depth * 24, 
        borderLeft: depth > 0 ? '2px solid #e0e0e0' : 'none',
        paddingLeft: depth > 0 ? 16 : 0,
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: '12px 16px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}
    >
      {/* Header: username + thời gian */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <strong style={{ color: '#1a1a2e' }}>{comment.username || 'Anonymous'}</strong>
        <span style={{ fontSize: 12, color: '#888' }}>
          {new Date(comment.created_at).toLocaleString()}
        </span>
      </div>

      {/* Nội dung bình luận */}
      <p style={{ margin: '0 0 12px 0', fontSize: 14, lineHeight: 1.5, color: '#333' }}>
        {comment.content}
      </p>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Vote buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => handleVote(1)}
            style={{
              background: currentVote === 1 ? '#ff4500' : '#f0f0f0',
              color: currentVote === 1 ? '#fff' : '#333',
              border: 'none',
              borderRadius: 4,
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 'bold'
            }}
          >
            ▲ Upvote
          </button>
          <span style={{ fontWeight: 'bold', minWidth: 30, textAlign: 'center' }}>
            {voteCount}
          </span>
          <button
            onClick={() => handleVote(-1)}
            style={{
              background: currentVote === -1 ? '#7193ff' : '#f0f0f0',
              color: currentVote === -1 ? '#fff' : '#333',
              border: 'none',
              borderRadius: 4,
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 'bold'
            }}
          >
            ▼ Downvote
          </button>
        </div>

        {/* Reply button */}
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          style={{
            background: 'none',
            border: 'none',
            color: '#0079d3',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500
          }}
        >
          💬 Trả lời
        </button>

        {/* Delete button (chỉ hiện nếu có quyền) */}
        {comment.can_delete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff4500',
              cursor: 'pointer',
              fontSize: 12,
              opacity: isDeleting ? 0.5 : 1
            }}
          >
            {isDeleting ? 'Đang xóa...' : '🗑 Xóa'}
          </button>
        )}
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <div style={{ marginTop: 16 }}>
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSuccess={() => {
              setShowReplyForm(false);
              if (onReply) onReply();
            }}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Hiển thị replies con (đệ quy) */}
      {comment.replies?.length > 0 && depth < maxDepth && (
        <div style={{ marginTop: 16 }}>
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;