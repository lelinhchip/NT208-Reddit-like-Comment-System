import { useEffect, useState, useCallback } from 'react';
import { getCommentsByPostId, deleteComment } from '../api/commentApi';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

const CommentList = ({ postId, refreshTrigger }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm tải danh sách bình luận từ API
  const loadComments = useCallback(async () => {
    if (!postId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getCommentsByPostId(postId);
      // Chuyển đổi dữ liệu flat thành nested tree
      const nestedComments = buildCommentTree(data);
      setComments(nestedComments);
    } catch (err) {
      console.error('Lỗi tải comment:', err);
      setError(err.message || 'Không thể tải bình luận');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // Hàm chuyển đổi flat array thành nested tree
  const buildCommentTree = (flatComments) => {
    const commentMap = {};
    const roots = [];

    // Tạo map cho tất cả comments
    flatComments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    // Xây dựng cây
    flatComments.forEach(comment => {
      if (comment.parent_id === null || !commentMap[comment.parent_id]) {
        roots.push(commentMap[comment.id]);
      } else {
        commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
      }
    });

    // Sắp xếp theo thời gian (cũ lên trước hoặc mới lên trước)
    const sortComments = (items) => {
      items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      items.forEach(item => {
        if (item.replies?.length) sortComments(item.replies);
      });
    };
    sortComments(roots);

    return roots;
  };

  // Xử lý khi xóa comment
  const handleDeleteComment = (commentId) => {
    // Cập nhật state: xóa comment khỏi cây
    const removeCommentFromTree = (items) => {
      return items.filter(item => {
        if (item.id === commentId) return false;
        if (item.replies?.length) {
          item.replies = removeCommentFromTree(item.replies);
        }
        return true;
      });
    };
    setComments(prev => removeCommentFromTree(prev));
  };

  // Tải lại comment khi postId hoặc refreshTrigger thay đổi
  useEffect(() => {
    loadComments();
  }, [loadComments, refreshTrigger]);

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div>⏳ Đang tải bình luận...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: 'red' }}>
        <div>❌ {error}</div>
        <button 
          onClick={loadComments} 
          style={{ marginTop: 10, padding: '6px 12px', cursor: 'pointer' }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      {/* Form tạo bình luận mới (cấp root) */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ marginBottom: 12 }}>💬 Viết bình luận</h4>
        <CommentForm
          postId={postId}
          parentId={null}
          onSuccess={loadComments}
        />
      </div>

      {/* Danh sách bình luận */}
      <div>
        <h4 style={{ marginBottom: 16 }}>
          📝 Tất cả bình luận ({comments.length})
        </h4>
        
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onReply={loadComments}
              onDelete={handleDeleteComment}
              depth={0}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentList;