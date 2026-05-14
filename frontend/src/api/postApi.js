import client from './client';

// 1. Lấy tất cả posts (có phân trang)
export const getAllPosts = async (limit = 20, offset = 0) => {
  try {
    const response = await client.get('/posts', {
      params: { limit, offset }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi lấy danh sách posts' };
  }
};

// 2. Lấy chi tiết post theo ID
export const getPostById = async (id) => {
  try {
    const response = await client.get(`/posts/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi lấy chi tiết post' };
  }
};

// 3. Tạo post mới
export const createPost = async (postData) => {
  try {
    const response = await client.post('/posts', postData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi tạo post' };
  }
};

// 4. Cập nhật post
export const updatePost = async (id, postData) => {
  try {
    const response = await client.put(`/posts/${id}`, postData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi cập nhật post' };
  }
};

// 5. Xóa post
export const deletePost = async (id) => {
  try {
    const response = await client.delete(`/posts/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi xóa post' };
  }
};

// 6. Vote post (upvote/downvote)
export const votePost = async (id, voteType) => {
  try {
    const response = await client.post(`/posts/${id}/vote`, { vote_type: voteType });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi vote post' };
  }
};
