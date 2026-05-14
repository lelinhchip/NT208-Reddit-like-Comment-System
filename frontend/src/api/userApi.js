import client from './client';

// 1. Đăng ký user mới
export const registerUser = async (userData) => {
  try {
    const response = await client.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi đăng ký' };
  }
};

// 2. Đăng nhập
export const loginUser = async (credentials) => {
  try {
    const response = await client.post('/users/login', credentials);
    // Lưu token vào localStorage
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi đăng nhập' };
  }
};

// 3. Lấy thông tin user theo ID
export const getUserById = async (id) => {
  try {
    const response = await client.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi lấy thông tin user' };
  }
};

// 4. Lấy danh sách tất cả users
export const getAllUsers = async () => {
  try {
    const response = await client.get('/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi lấy danh sách users' };
  }
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

// Lấy token từ localStorage
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Lấy user hiện tại
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Kiểm tra user đã đăng nhập chưa
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};
