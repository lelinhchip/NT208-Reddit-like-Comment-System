import client from './client';

export const getCommentsByPostId = async (postId, sort = 'new') => {
    try {
        const response = await client.get(`/comments/post/${postId}`, { params: { sort } });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi lấy danh sách bình luận' };
    }
};

export const getCommentById = async (id) => {
    try {
        const response = await client.get(`/comments/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi lấy chi tiết bình luận' };
    }
};

export const getCommentReplies = async (commentId) => {
    try {
        const response = await client.get(`/comments/${commentId}/replies`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi lấy replies' };
    }
};

export const createComment = async (commentData) => {
    try {
        const response = await client.post('/comments', commentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi tạo bình luận' };
    }
};

export const updateComment = async (id, commentData) => {
    try {
        const response = await client.put(`/comments/${id}`, commentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi cập nhật bình luận' };
    }
};

export const deleteComment = async (id) => {
    try {
        const response = await client.delete(`/comments/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi xóa bình luận' };
    }
};

export const voteComment = async (id, voteType) => {
    try {
        const response = await client.post(`/comments/${id}/vote`, { vote_type: Number(voteType) });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi vote bình luận' };
    }
};
