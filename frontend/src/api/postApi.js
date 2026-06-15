import client, { getApiError } from './client';

export const getAllPosts = async ({ page = 1, limit = 10, sort = 'new' } = {}) => {
  try {
    const response = await client.get('/posts', {
      params: { page, limit, sort },
    });
    return response.data;
  } catch (error) {
    throw getApiError(error, 'Lỗi lấy danh sách bài đăng');
  }
};

export const getTopPosts = async (limit = 5) => {
    try {
        const response = await client.get('/posts/top', { params: { limit } });
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi lấy bài đăng nổi bật');
    }
};

export const searchPosts = async (q, { page = 1, limit = 10 } = {}) => {
    try {
        const response = await client.get('/posts/search', {
            params: { q, page, limit },
        });
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi tìm kiếm bài đăng');
    }
};

export const getUserPosts = async (userId, { page = 1, limit = 10 } = {}) => {
    try {
        const response = await client.get(`/posts/user/${userId}`, {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi lấy bài đăng của người dùng');
    }
};

// 2. Lấy chi tiết post theo ID
export const getPostById = async (id) => {
    try {
        const response = await client.get(`/posts/${id}`);
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi lấy chi tiết bài đăng');
    }
};

export const createPost = async ({ community, title, content }) => {
    try {
        const response = await client.post('/posts', { community, title, content });
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi tạo bài đăng');
    }
};

export const updatePost = async (id, { community, title, content }) => {
    try {
        const response = await client.put(`/posts/${id}`, { community, title, content });
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi cập nhật bài đăng');
    }
};

export const deletePost = async (id) => {
    try {
        const response = await client.delete(`/posts/${id}`);
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi xóa bài đăng');
    }
};

export const votePost = async (id, voteType) => {
    try {
        const response = await client.post(`/posts/${id}/vote`, { voteType: Number(voteType) });
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi vote bài đăng');
    }
};

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
        const response = await client.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi tải ảnh lên');
    }
};
