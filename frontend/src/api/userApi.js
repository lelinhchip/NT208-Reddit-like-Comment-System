import client, { getApiError } from './client';

function persistAuth(data) {
    if (data?.token) {
        localStorage.setItem('authToken', data.token);
    }
    if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
    }
}

export const registerUser = async ({ username, email, password }) => {
    try {
        const response = await client.post('/users/register', { username, email, password });
        persistAuth(response.data);
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi đăng ký');
    }
};

export const loginUser = async ({ username, password }) => {
    try {
        const response = await client.post('/users/login', { username, password });
        persistAuth(response.data);
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi đăng nhập');
    }
};

export const getUserById = async (id) => {
    try {
        const response = await client.get(`/users/${id}`);
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi lấy thông tin user');
    }
};

export const getAllUsers = async () => {
    try {
        const response = await client.get('/users');
        return response.data;
    } catch (error) {
        throw getApiError(error, 'Lỗi lấy danh sách users');
    }
};

export const logoutUser = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
};

export const getAuthToken = () => localStorage.getItem('authToken');

export const getCurrentUser = () => {
    try {
        const rawUser = localStorage.getItem('user');
        return rawUser ? JSON.parse(rawUser) : null;
    } catch {
        localStorage.removeItem('user');
        return null;
    }
};

export const isAuthenticated = () => Boolean(getAuthToken());
