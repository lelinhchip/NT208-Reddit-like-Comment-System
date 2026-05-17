import { useState } from 'react';
import { createComment } from '../api/commentApi';

const CommentForm = ({ postId, parentId = null, onSuccess, onCancel }) => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await createComment({
        post_id: postId,
        parent_id: parentId,
        content: content.trim()
      });
      setContent('');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Lỗi gửi bình luận:', error);
      alert(error.message || 'Gửi bình luận thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "Viết câu trả lời..." : "Viết bình luận..."}
        rows={3}
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 8,
          border: '1px solid #ccc',
          fontSize: 14,
          resize: 'vertical'
        }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          style={{
            background: '#0079d3',
            color: '#fff',
            border: 'none',
            borderRadius: 20,
            padding: '8px 16px',
            cursor: submitting || !content.trim() ? 'not-allowed' : 'pointer',
            opacity: submitting || !content.trim() ? 0.6 : 1
          }}
        >
          {submitting ? 'Đang gửi...' : 'Gửi'}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: '#f0f0f0',
              border: 'none',
              borderRadius: 20,
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  );
};

export default CommentForm;