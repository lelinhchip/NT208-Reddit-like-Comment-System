import client, { getApiError } from './client';

// 1. Lấy tất cả bình luận của một post
export const getCommentsByPostId = async (postId) => {
  try {
    const response = await client.get(`/comments/post/${postId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi lấy danh sách bình luận' };
  }
};

// 2. Lấy chi tiết bình luận theo ID
export const getCommentById = async (id) => {
  try {
    const response = await client.get(`/comments/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi lấy chi tiết bình luận' };
  }
};

export const searchComments = async (postId, keyword) => {
    try {
        const response = await client.get(`/comments/post/${postId}/search`, {
            params: { keyword },
        });
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi tìm kiếm bình luận');
    }
};

export const countTotalReplies = async (postId, commentId) => {
    try {
        const response = await client.get(`/comments/post/${postId}/comment/${commentId}/count`);
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi đếm phản hồi');
    }
};

export const getThreadParticipants = async (postId, commentId) => {
    try {
        const response = await client.get(`/comments/post/${postId}/comment/${commentId}/participants`);
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi lấy người tham gia');
    }
};

// 4. Tạo bình luận mới
export const createComment = async ({ post_id, content, parent_comment_id = null }) => {
    try {
        const response = await client.post('/comments', {
            post_id: Number(post_id),
            content,
            parent_comment_id,
        });
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi tạo bình luận');
    }
};


// 5. Cập nhật bình luận
export const updateComment = async (id, { content }) => {
    try {
        const response = await client.put(`/comments/${id}`, { content });
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi cập nhật bình luận');
    }
};

// 6. Xóa bình luận
export const deleteComment = async (id) => {
  try {
    const response = await client.delete(`/comments/${id}`);
    return response.data;
  } catch (error) {
    throw getApiError(error, 'Lỗi xóa bình luận');
  }
};


// 7. Vote bình luận (upvote/downvote)
export const voteComment = async (id, voteType) => {
  try {
    const response = await client.post(`/comments/${id}/vote`, { vote_type: Number(voteType) });
    return response.data;
  } catch (error) {
    throw getApiError(error, 'Lỗi vote bình luận');
  }
};

