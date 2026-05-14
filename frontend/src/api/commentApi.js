import client from './client';

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

// 3. Lấy các replies của một bình luận
export const getCommentReplies = async (commentId) => {
  try {
    const response = await client.get(`/comments/${commentId}/replies`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi lấy replies' };
  }
};

// 4. Tạo bình luận mới
export const createComment = async (commentData) => {
  try {
    const response = await client.post('/comments', commentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi tạo bình luận' };
  }
};

// 5. Cập nhật bình luận
export const updateComment = async (id, commentData) => {
  try {
    const response = await client.put(`/comments/${id}`, commentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi cập nhật bình luận' };
  }
};

// 6. Xóa bình luận
export const deleteComment = async (id) => {
  try {
    const response = await client.delete(`/comments/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi xóa bình luận' };
  }
};

// 7. Vote bình luận (upvote/downvote)
export const voteComment = async (id, voteType) => {
  try {
    const response = await client.post(`/comments/${id}/vote`, { vote_type: voteType });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi vote bình luận' };
  }
};
